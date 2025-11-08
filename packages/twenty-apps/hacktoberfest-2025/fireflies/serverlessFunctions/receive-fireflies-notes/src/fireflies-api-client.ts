import { createLogger } from './logger';
import type { FirefliesMeetingData, FirefliesParticipant, SummaryFetchConfig } from './types';

const logger = createLogger('fireflies-api');

export class FirefliesApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      logger.critical('FIREFLIES_API_KEY is required but not provided - this is a critical configuration error');
      throw new Error('FIREFLIES_API_KEY is required');
    }
    this.apiKey = apiKey;
  }

  async fetchMeetingData(
    meetingId: string,
    options?: { timeout?: number }
  ): Promise<FirefliesMeetingData> {
    const query = `
      query GetTranscript($transcriptId: String!) {
        transcript(id: $transcriptId) {
          id
          title
          date
          duration
          participants
          organizer_email
          meeting_attendees {
            displayName
            email
            phoneNumber
            name
            location
          }
          meeting_attendance {
            name
            join_time
            leave_time
          }
          speakers {
            name
          }
          summary {
            action_items
            overview
          }
          transcript_url
        }
      }
    `;

    const controller = new AbortController();
    const timeoutId = options?.timeout
      ? setTimeout(() => controller.abort(), options.timeout)
      : null;

    try {
      const response = await fetch('https://api.fireflies.ai/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          variables: { transcriptId: meetingId },
        }),
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetails = `Fireflies API request failed with status ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorDetails += `: ${errorBody}`;
          }
        } catch {
          // Ignore if we can't read the response body
        }
        throw new Error(errorDetails);
      }

      const json = await response.json() as {
        data?: { transcript?: any };
        errors?: Array<{ message?: string }>;
      };

      if (json.errors && json.errors.length > 0) {
        throw new Error(`Fireflies API error: ${json.errors[0]?.message || 'Unknown error'}`);
      }

      const transcript = json.data?.transcript;
      if (!transcript) {
        throw new Error('Invalid response from Fireflies API: missing transcript data');
      }

      return this.transformMeetingData(transcript, meetingId);
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      throw error;
    }
  }

  async fetchMeetingDataWithRetry(
    meetingId: string,
    config: SummaryFetchConfig
  ): Promise<{ data: FirefliesMeetingData; summaryReady: boolean }> {
    // immediate_only: single attempt, no retries
    if (config.strategy === 'immediate_only') {
      logger.debug(`fetching meeting ${meetingId} (strategy: immediate_only)`);
      const meetingData = await this.fetchMeetingData(meetingId, { timeout: 10000 });
      const ready = this.isSummaryReady(meetingData);
      logger.debug(`summary ready: ${ready}`);
      return { data: meetingData, summaryReady: ready };
    }

    // immediate_with_retry: retry with exponential backoff
    logger.debug(`fetching meeting ${meetingId} (strategy: immediate_with_retry, maxAttempts: ${config.retryAttempts})`);

    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        const meetingData = await this.fetchMeetingData(meetingId, { timeout: 10000 });
        const ready = this.isSummaryReady(meetingData);

        logger.debug(`attempt ${attempt}/${config.retryAttempts}: summary ready=${ready}`);

        if (ready) {
          return { data: meetingData, summaryReady: true };
        }

        if (attempt < config.retryAttempts) {
          const delayMs = config.retryDelay * attempt;
          logger.debug(`summary not ready, waiting ${delayMs}ms before retry ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          logger.debug(`max retries reached, returning partial data`);
          return { data: meetingData, summaryReady: false };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(`attempt ${attempt}/${config.retryAttempts} failed: ${errorMsg}`);

        if (attempt === config.retryAttempts) {
          throw error;
        }

        const delayMs = config.retryDelay * attempt;
        logger.debug(`retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    throw new Error('Failed to fetch meeting data after retries');
  }

  private isSummaryReady(meetingData: FirefliesMeetingData): boolean {
    return (
      (meetingData.summary?.action_items?.length > 0) ||
      (meetingData.summary?.overview?.length > 0) ||
      meetingData.summary_status === 'completed'
    );
  }

  private extractAllParticipants(transcript: any): FirefliesParticipant[] {
    const participantsWithEmails: FirefliesParticipant[] = [];
    const participantsNameOnly: FirefliesParticipant[] = [];

    logger.debug('=== PARTICIPANT EXTRACTION DEBUG ===');
    logger.debug('participants field:', JSON.stringify(transcript.participants));
    logger.debug('meeting_attendees field:', JSON.stringify(transcript.meeting_attendees));
    logger.debug('speakers field:', transcript.speakers?.map((s: any) => s.name));
    logger.debug('meeting_attendance field:', transcript.meeting_attendance?.map((a: any) => a.name));
    logger.debug('organizer_email:', transcript.organizer_email);

    // Helper function to check if a string is an email
    const isEmail = (str: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
    };

    // Helper function to check if already exists
    const isDuplicate = (name: string, email: string): boolean => {
      const nameLower = name.toLowerCase().trim();
      const emailLower = email.toLowerCase().trim();

      return participantsWithEmails.some(p =>
        p.name.toLowerCase().trim() === nameLower ||
        (email && p.email.toLowerCase() === emailLower)
      ) || participantsNameOnly.some(p =>
        p.name.toLowerCase().trim() === nameLower
      );
    };

    // 1. Extract from legacy participants field (with emails)
    if (transcript.participants && Array.isArray(transcript.participants)) {
      transcript.participants.forEach((participant: string) => {
        // Handle comma-separated emails or names
        const parts = participant.split(',').map(p => p.trim());

        parts.forEach(part => {
          const emailMatch = part.match(/<([^>]+)>/);
          const email = emailMatch ? emailMatch[1] : '';
          // Extract name properly: if there's an email in angle brackets, get the part before it
          const name = emailMatch
            ? part.substring(0, part.indexOf('<')).trim()
            : part.trim();

          // Skip if the "name" is actually an email address
          if (isEmail(name)) {
            logger.debug(`Skipping participant with email as name: "${name}"`);
            return;
          }

          // Skip if empty name
          if (!name) {
            return;
          }

          // Skip duplicates
          if (isDuplicate(name, email)) {
            logger.debug(`Skipping duplicate participant: "${name}" <${email}>`);
            return;
          }

          if (name && email) {
            participantsWithEmails.push({ name, email });
          } else if (name) {
            participantsNameOnly.push({ name, email: '' });
          }
        });
      });
    }

    // 2. Extract from meeting_attendees field (structured)
    if (transcript.meeting_attendees && Array.isArray(transcript.meeting_attendees)) {
      transcript.meeting_attendees.forEach((attendee: any) => {
        const name = attendee.displayName || attendee.name || '';
        const email = attendee.email || '';

        // Skip if name is actually an email
        if (isEmail(name)) {
          logger.debug(`Skipping attendee with email as name: "${name}"`);
          return;
        }

        if (name && !isDuplicate(name, email)) {
          if (email) {
            participantsWithEmails.push({ name, email });
          } else {
            participantsNameOnly.push({ name, email: '' });
          }
        }
      });
    }

    // 3. Extract from speakers field (name only)
    if (transcript.speakers && Array.isArray(transcript.speakers)) {
      transcript.speakers.forEach((speaker: any) => {
        const name = speaker.name || '';

        // Skip if name is actually an email
        if (isEmail(name)) {
          logger.debug(`Skipping speaker with email as name: "${name}"`);
          return;
        }

        if (name && !isDuplicate(name, '')) {
          participantsNameOnly.push({ name, email: '' });
        }
      });
    }

    // 4. Extract from meeting_attendance field (name only)
    if (transcript.meeting_attendance && Array.isArray(transcript.meeting_attendance)) {
      transcript.meeting_attendance.forEach((attendance: any) => {
        const name = attendance.name || '';

        // Skip if name is actually an email or contains comma-separated emails
        if (isEmail(name) || name.includes(',')) {
          logger.debug(`Skipping attendance with email/list as name: "${name}"`);
          return;
        }

        if (name && !isDuplicate(name, '')) {
          participantsNameOnly.push({ name, email: '' });
        }
      });
    }

    // 5. Add organizer email if available and not already included
    const organizerEmail = transcript.organizer_email;
    if (organizerEmail) {
      // Check if organizer email is already in the participants
      const existsWithEmail = participantsWithEmails.some(p =>
        p.email.toLowerCase() === organizerEmail.toLowerCase()
      );

      if (!existsWithEmail) {
        // Try to find organizer name from speakers/attendance and match with email
        let organizerName = '';

        // Extract username from organizer email for matching
        const emailUsername = organizerEmail.split('@')[0].toLowerCase();
        const emailNameVariations = [emailUsername];

        // Add common name variations based on email username
        if (emailUsername === 'alex') {
          emailNameVariations.push('alexander', 'alexandre', 'alex');
        }

        // Look for organizer in speakers by matching email username to speaker names
        if (transcript.speakers && Array.isArray(transcript.speakers)) {
          const potentialOrganizerSpeaker = transcript.speakers.find((speaker: any) => {
            const name = (speaker.name || '').toLowerCase();
            return emailNameVariations.some(variation =>
              name.includes(variation) || variation.includes(name)
            );
          });
          if (potentialOrganizerSpeaker) {
            organizerName = potentialOrganizerSpeaker.name;
          }
        }

        // Look for organizer in attendance
        if (!organizerName && transcript.meeting_attendance && Array.isArray(transcript.meeting_attendance)) {
          const potentialOrganizerAttendance = transcript.meeting_attendance.find((attendance: any) => {
            const name = (attendance.name || '').toLowerCase();
            return emailNameVariations.some(variation =>
              name.includes(variation) || variation.includes(name)
            );
          });
          if (potentialOrganizerAttendance) {
            organizerName = potentialOrganizerAttendance.name;
          }
        }

        // If we found a name match, add as participant with email
        if (organizerName) {
          participantsWithEmails.push({ name: organizerName, email: organizerEmail });

          // Remove from name-only participants to avoid duplicates
          const nameIndex = participantsNameOnly.findIndex(p =>
            p.name.toLowerCase().includes(organizerName.toLowerCase()) ||
            organizerName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (nameIndex !== -1) {
            participantsNameOnly.splice(nameIndex, 1);
          }
        } else {
          // If no name found, add with generic organizer name
          participantsWithEmails.push({ name: 'Meeting Organizer', email: organizerEmail });
        }
      }
    }

    // Return participants with emails first, then name-only participants
    const allParticipants = [...participantsWithEmails, ...participantsNameOnly];

    logger.debug('=== EXTRACTED PARTICIPANTS ===');
    logger.debug('With emails:', participantsWithEmails.length, JSON.stringify(participantsWithEmails));
    logger.debug('Name only:', participantsNameOnly.length, JSON.stringify(participantsNameOnly));
    logger.debug('Total:', allParticipants.length);

    return allParticipants;
  }

  private transformMeetingData(transcript: any, meetingId: string): FirefliesMeetingData {
    // Convert date to ISO string - handle both timestamp and ISO string formats
    let dateString: string;
    if (transcript.date) {
      if (typeof transcript.date === 'number') {
        // Unix timestamp in milliseconds
        dateString = new Date(transcript.date).toISOString();
      } else if (typeof transcript.date === 'string') {
        // Could be ISO string or timestamp string
        const parsed = Number(transcript.date);
        if (!isNaN(parsed)) {
          // It's a numeric string (timestamp)
          dateString = new Date(parsed).toISOString();
        } else {
          // It's already an ISO string
          dateString = transcript.date;
        }
      } else {
        dateString = new Date().toISOString();
      }
    } else {
      dateString = new Date().toISOString();
    }

    return {
      id: transcript.id || meetingId,
      title: transcript.title || 'Untitled Meeting',
      date: dateString,
      duration: transcript.duration || 0,
      participants: this.extractAllParticipants(transcript),
      organizer_email: transcript.organizer_email,
      summary: {
        action_items: Array.isArray(transcript.summary?.action_items)
          ? transcript.summary.action_items
          : (typeof transcript.summary?.action_items === 'string'
             ? [transcript.summary.action_items]
             : []),
        overview: transcript.summary?.overview || '',
        keywords: transcript.summary?.keywords,
        topics_discussed: transcript.summary?.topics_discussed,
        meeting_type: transcript.summary?.meeting_type,
      },
      analytics: transcript.sentiments ? {
        sentiments: {
          positive_pct: transcript.sentiments.positive_pct || 0,
          negative_pct: transcript.sentiments.negative_pct || 0,
          neutral_pct: transcript.sentiments.neutral_pct || 0,
        }
      } : undefined,
      transcript_url: transcript.transcript_url || `https://app.fireflies.ai/view/${meetingId}`,
      recording_url: transcript.video_url || undefined,
      summary_status: transcript.summary_status,
    };
  }
}

