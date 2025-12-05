import { createLogger } from './logger';
import {
  FIREFLIES_PLANS,
  type FirefliesMeetingData,
  type FirefliesParticipant,
  type FirefliesPlan,
  type SummaryFetchConfig
} from './types';

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
    options?: { timeout?: number; plan?: FirefliesPlan }
  ): Promise<FirefliesMeetingData> {
    const plan = options?.plan ?? FIREFLIES_PLANS.FREE;
    const isPremiumPlan =
      plan === FIREFLIES_PLANS.BUSINESS || plan === FIREFLIES_PLANS.ENTERPRISE;

    const basicQuery = `
      query GetTranscriptBasic($transcriptId: String!) {
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
            keywords
            topics_discussed
            meeting_type
          }
          transcript_url
          video_url
        }
      }
    `;

    const businessQuery = `
      query GetTranscriptFull($transcriptId: String!) {
        transcript(id: $transcriptId) {
          id
          title
          date
          duration
          participants
          organizer_email
          analytics {
            sentiments {
              positive_pct
              negative_pct
              neutral_pct
            }
          }
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
            keywords
            topics_discussed
            meeting_type
          }
          transcript_url
          video_url
        }
      }
    `;

    const queryToUse = isPremiumPlan ? businessQuery : basicQuery;

    try {
      return await this.executeTranscriptQuery({
        meetingId,
        query: queryToUse,
        timeout: options?.timeout,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const planError =
        message.toLowerCase().includes('business or higher plan') ||
        message.includes('Cannot query field "sentiments"') ||
        message.includes('Cannot query field "analytics"');

      if (isPremiumPlan && planError) {
        logger.warn('Fireflies plan limitation detected, retrying with basic query (analytics/sentiments unavailable)');
        return this.executeTranscriptQuery({
          meetingId,
          query: basicQuery,
          timeout: options?.timeout,
        });
      }

      throw error;
    }
  }

  async fetchMeetingDataWithRetry(
    meetingId: string,
    config: SummaryFetchConfig,
    plan: FirefliesPlan = FIREFLIES_PLANS.FREE
  ): Promise<{ data: FirefliesMeetingData; summaryReady: boolean }> {
    // immediate_only: single attempt, no retries
    if (config.strategy === 'immediate_only') {
      logger.debug(`fetching meeting ${meetingId} (strategy: immediate_only)`);
      const meetingData = await this.fetchMeetingData(meetingId, { timeout: 10000, plan });
      const ready = this.isSummaryReady(meetingData);
      logger.debug(`summary ready: ${ready}`);
      return { data: meetingData, summaryReady: ready };
    }

    // immediate_with_retry: retry with exponential backoff
    logger.debug(`fetching meeting ${meetingId} (strategy: immediate_with_retry, maxAttempts: ${config.retryAttempts})`);

    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        const meetingData = await this.fetchMeetingData(meetingId, { timeout: 10000, plan });
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

  private async executeTranscriptQuery({
    meetingId,
    query,
    timeout,
  }: {
    meetingId: string;
    query: string;
    timeout?: number;
  }): Promise<FirefliesMeetingData> {
    const controller = new AbortController();
    const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

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
        data?: { transcript?: Record<string, unknown> };
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
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private isSummaryReady(meetingData: FirefliesMeetingData): boolean {
    return (
      (meetingData.summary?.action_items?.length > 0) ||
      (meetingData.summary?.overview?.length > 0) ||
      meetingData.summary_status === 'completed'
    );
  }

  private extractAllParticipants(transcript: Record<string, unknown>): FirefliesParticipant[] {
    const participantsWithEmails: FirefliesParticipant[] = [];
    const participantsNameOnly: FirefliesParticipant[] = [];

    logger.debug('=== PARTICIPANT EXTRACTION DEBUG ===');
    logger.debug('participants field:', JSON.stringify(transcript.participants));
    logger.debug('meeting_attendees field:', JSON.stringify(transcript.meeting_attendees));
    logger.debug('speakers field:', (transcript.speakers as Array<{ name: string }>)?.map((s) => s.name));
    logger.debug('meeting_attendance field:', (transcript.meeting_attendance as Array<{ name: string }>)?.map((a) => a.name));
    logger.debug('organizer_email:', transcript.organizer_email);

    const isEmail = (str: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
    };

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
        const parts = participant.split(',').map(p => p.trim());

        parts.forEach(part => {
          const emailMatch = part.match(/<([^>]+)>/);
          const email = emailMatch ? emailMatch[1] : '';
          const name = emailMatch
            ? part.substring(0, part.indexOf('<')).trim()
            : part.trim();

          if (isEmail(name)) {
            logger.debug(`Skipping participant with email as name: "${name}"`);
            return;
          }

          if (!name) {
            return;
          }

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
      transcript.meeting_attendees.forEach((attendee: Record<string, unknown>) => {
        const name = (attendee.displayName || attendee.name || '') as string;
        const email = (attendee.email || '') as string;

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
      transcript.speakers.forEach((speaker: Record<string, unknown>) => {
        const name = (speaker.name || '') as string;

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
      transcript.meeting_attendance.forEach((attendance: Record<string, unknown>) => {
        const name = (attendance.name || '') as string;

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
    const organizerEmail = transcript.organizer_email as string | undefined;
    if (organizerEmail) {
      const existsWithEmail = participantsWithEmails.some(p =>
        p.email.toLowerCase() === organizerEmail.toLowerCase()
      );

      if (!existsWithEmail) {
        let organizerName = '';

        const emailUsername = organizerEmail.split('@')[0].toLowerCase();
        const emailNameVariations = [emailUsername];

        if (emailUsername === 'alex') {
          emailNameVariations.push('alexander', 'alexandre', 'alex');
        }

        if (transcript.speakers && Array.isArray(transcript.speakers)) {
          const potentialOrganizerSpeaker = transcript.speakers.find((speaker: Record<string, unknown>) => {
            const name = ((speaker.name || '') as string).toLowerCase();
            return emailNameVariations.some(variation =>
              name.includes(variation) || variation.includes(name)
            );
          }) as Record<string, unknown> | undefined;
          if (potentialOrganizerSpeaker) {
            organizerName = potentialOrganizerSpeaker.name as string;
          }
        }

        if (!organizerName && transcript.meeting_attendance && Array.isArray(transcript.meeting_attendance)) {
          const potentialOrganizerAttendance = transcript.meeting_attendance.find((attendance: Record<string, unknown>) => {
            const name = ((attendance.name || '') as string).toLowerCase();
            return emailNameVariations.some(variation =>
              name.includes(variation) || variation.includes(name)
            );
          }) as Record<string, unknown> | undefined;
          if (potentialOrganizerAttendance) {
            organizerName = potentialOrganizerAttendance.name as string;
          }
        }

        if (organizerName) {
          participantsWithEmails.push({ name: organizerName, email: organizerEmail });

          const nameIndex = participantsNameOnly.findIndex(p =>
            p.name.toLowerCase().includes(organizerName.toLowerCase()) ||
            organizerName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (nameIndex !== -1) {
            participantsNameOnly.splice(nameIndex, 1);
          }
        } else {
          participantsWithEmails.push({ name: 'Meeting Organizer', email: organizerEmail });
        }
      }
    }

    const allParticipants = [...participantsWithEmails, ...participantsNameOnly];

    logger.debug('=== EXTRACTED PARTICIPANTS ===');
    logger.debug('With emails:', participantsWithEmails.length, JSON.stringify(participantsWithEmails));
    logger.debug('Name only:', participantsNameOnly.length, JSON.stringify(participantsNameOnly));
    logger.debug('Total:', allParticipants.length);

    return allParticipants;
  }

  private transformMeetingData(transcript: Record<string, unknown>, meetingId: string): FirefliesMeetingData {
    let dateString: string;
    if (transcript.date) {
      if (typeof transcript.date === 'number') {
        dateString = new Date(transcript.date).toISOString();
      } else if (typeof transcript.date === 'string') {
        const parsed = Number(transcript.date);
        if (!isNaN(parsed)) {
          dateString = new Date(parsed).toISOString();
        } else {
          dateString = transcript.date;
        }
      } else {
        dateString = new Date().toISOString();
      }
    } else {
      dateString = new Date().toISOString();
    }

    const summary = transcript.summary as Record<string, unknown> | undefined;
    const analytics = transcript.analytics as Record<string, unknown> | undefined;
    const sentiments = analytics?.sentiments as Record<string, number> | undefined;

    return {
      id: (transcript.id as string) || meetingId,
      title: (transcript.title as string) || 'Untitled Meeting',
      date: dateString,
      duration: (transcript.duration as number) || 0,
      participants: this.extractAllParticipants(transcript),
      organizer_email: transcript.organizer_email as string | undefined,
      summary: {
        action_items: Array.isArray(summary?.action_items)
          ? summary.action_items as string[]
          : (typeof summary?.action_items === 'string'
             ? [summary.action_items]
             : []),
        overview: (summary?.overview as string) || '',
        keywords: summary?.keywords as string[] | undefined,
        topics_discussed: summary?.topics_discussed as string[] | undefined,
        meeting_type: summary?.meeting_type as string | undefined,
      },
      analytics: sentiments ? {
        sentiments: {
          positive_pct: sentiments.positive_pct || 0,
          negative_pct: sentiments.negative_pct || 0,
          neutral_pct: sentiments.neutral_pct || 0,
        }
      } : undefined,
      transcript_url: (transcript.transcript_url as string) || `https://app.fireflies.ai/view/${meetingId}`,
      recording_url: (transcript.video_url as string) || undefined,
      summary_status: transcript.summary_status as string | undefined,
    };
  }
}

