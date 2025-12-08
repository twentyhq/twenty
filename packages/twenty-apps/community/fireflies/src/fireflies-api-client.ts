import { createLogger } from './logger';
import {
  FIREFLIES_PLANS,
  type FirefliesMeetingData,
  type FirefliesParticipant,
  type FirefliesPlan,
  type FirefliesTranscriptListItem,
  type FirefliesTranscriptListOptions,
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

  async listTranscripts(options: FirefliesTranscriptListOptions = {}): Promise<FirefliesTranscriptListItem[]> {
    const {
      organizers,
      participants,
      hostEmail,
      participantEmail,
      userId,
      channelId,
      mine,
      fromDate,
      toDate,
      pageSize = 50,
      maxRecords = 500,
    } = options;

    const sanitizedOrganizers = organizers?.filter(Boolean);
    const sanitizedParticipants = participants?.filter(Boolean);

    const transcripts: FirefliesTranscriptListItem[] = [];
    let skip = options.skip ?? 0;
    const limit = options.limit ?? pageSize;

    const baseQuery = `
      query Transcripts(
        $limit: Int
        $skip: Int
        $hostEmail: String
        $participantEmail: String
        $organizers: [String!]
        $participants: [String!]
        $userId: String
        $channelId: String
        $mine: Boolean
        $date: Float
      ) {
        transcripts(
          limit: $limit
          skip: $skip
          host_email: $hostEmail
          participant_email: $participantEmail
          organizers: $organizers
          participants: $participants
          user_id: $userId
          channel_id: $channelId
          mine: $mine
          date: $date
        ) {
          id
          title
          date
          duration
          organizer_email
          participants
          transcript_url
          meeting_link
          meeting_info { summary_status }
        }
      }
    `;

    while (transcripts.length < maxRecords) {
      const pageVariables = {
        limit,
        skip,
        hostEmail,
        participantEmail,
        organizers: sanitizedOrganizers,
        participants: sanitizedParticipants,
        userId,
        channelId,
        mine,
        date: fromDate,
      };

      const page = await this.executeTranscriptListQuery(baseQuery, pageVariables);
      const normalized = page
        .map((item) => {
          const normalizedDate = this.normalizeDate(item.date);
          return {
            id: (item.id as string) || '',
            title: (item.title as string) || 'Untitled Meeting',
            date: normalizedDate,
            duration: (item.duration as number) || 0,
            organizer_email: item.organizer_email as string | undefined,
            participants: Array.isArray(item.participants)
              ? (item.participants as string[])
              : undefined,
            transcript_url: item.transcript_url as string | undefined,
            meeting_link: item.meeting_link as string | undefined,
            summary_status: (item.meeting_info as { summary_status?: string } | undefined)?.summary_status,
          };
        })
        .filter((item) => {
          if (toDate && item.date) {
            const itemTime = Date.parse(item.date);
            if (!Number.isNaN(itemTime) && itemTime > toDate) {
              return false;
            }
          }
          return true;
        });

      transcripts.push(...normalized);

      if (page.length < limit) {
        break;
      }

      skip += limit;
    }

    if (transcripts.length > maxRecords) {
      return transcripts.slice(0, maxRecords);
    }

    return transcripts;
  }

  async fetchMeetingData(
    meetingId: string,
    options?: { timeout?: number; plan?: FirefliesPlan }
  ): Promise<FirefliesMeetingData> {
    const plan = options?.plan ?? FIREFLIES_PLANS.FREE;
    const isPremiumPlan =
      plan === FIREFLIES_PLANS.BUSINESS || plan === FIREFLIES_PLANS.ENTERPRISE;

    // Minimal query for free plans - only basic fields available on all plans
    // Note: audio_url requires Pro+, video_url requires Business+
    const freeQuery = `
      query GetTranscriptMinimal($transcriptId: String!) {
        transcript(id: $transcriptId) {
          id
          title
          date
          duration
          participants
          organizer_email
          transcript_url
          meeting_link
        }
      }
    `;

    // Standard query for pro plans - adds speakers, summary, sentences, and audio_url (Pro+)
    // Note: video_url requires Business+
    const proQuery = `
      query GetTranscriptBasic($transcriptId: String!) {
        transcript(id: $transcriptId) {
          id
          title
          date
          duration
          participants
          organizer_email
          speakers {
            name
          }
          sentences {
            index
            speaker_name
            text
            start_time
            end_time
          }
          summary {
            overview
            keywords
            action_items
            notes
            gist
            bullet_gist
            short_summary
            short_overview
            outline
            shorthand_bullet
          }
          meeting_info {
            summary_status
          }
          transcript_url
          audio_url
          meeting_link
        }
      }
    `;

    // Full query for business/enterprise - includes all fields
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
            categories {
              questions
              tasks
              metrics
              date_times
            }
            speakers {
              speaker_id
              name
              duration
              word_count
              longest_monologue
              filler_words
              questions
              words_per_minute
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
          sentences {
            index
            speaker_name
            text
            start_time
            end_time
            ai_filters {
              task
              question
              sentiment
            }
          }
          summary {
            action_items
            overview
            keywords
            notes
            gist
            bullet_gist
            short_summary
            short_overview
            outline
            shorthand_bullet
            topics_discussed
            meeting_type
            transcript_chapters
          }
          meeting_info {
            summary_status
          }
          transcript_url
          audio_url
          video_url
          meeting_link
        }
      }
    `;

    // Select query based on plan
    const queryToUse = isPremiumPlan ? businessQuery :
      (plan === FIREFLIES_PLANS.PRO ? proQuery : freeQuery);

    const planFeatures = {
      [FIREFLIES_PLANS.FREE]: 'basic fields only (no summary, no audio/video)',
      [FIREFLIES_PLANS.PRO]: 'summary, speakers, audio_url',
      [FIREFLIES_PLANS.BUSINESS]: 'full access including analytics, video_url',
      [FIREFLIES_PLANS.ENTERPRISE]: 'full access including analytics, video_url',
    };
    logger.debug(`using ${plan} plan query (${planFeatures[plan]})`);

    try {
      return await this.executeTranscriptQuery({
        meetingId,
        query: queryToUse,
        timeout: options?.timeout,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Detect plan-specific errors
      const requiresBusiness = message.toLowerCase().includes('business or higher');
      const requiresPro = message.toLowerCase().includes('pro or higher');
      const planError = requiresBusiness || requiresPro ||
        message.toLowerCase().includes('higher plan') ||
        message.includes('Cannot query field');

      // Fallback cascade: business -> pro -> free
      if (planError) {
        if (isPremiumPlan) {
          logger.warn(`Plan limitation detected (configured: ${plan}), falling back to pro query`);
          try {
            return await this.executeTranscriptQuery({
              meetingId,
              query: proQuery,
              timeout: options?.timeout,
            });
          } catch (proError) {
            const proMessage = proError instanceof Error ? proError.message : String(proError);
            if (proMessage.toLowerCase().includes('plan') || proMessage.includes('Cannot query field')) {
              logger.warn('Pro query also failed, falling back to minimal free query');
              return this.executeTranscriptQuery({
                meetingId,
                query: freeQuery,
                timeout: options?.timeout,
              });
            }
            throw proError;
          }
        } else if (plan === FIREFLIES_PLANS.PRO) {
          logger.warn(`Pro plan query failed (${requiresBusiness ? 'requires Business+' : 'unknown restriction'}), falling back to free query`);
          return this.executeTranscriptQuery({
            meetingId,
            query: freeQuery,
            timeout: options?.timeout,
          });
        } else {
          // Already using free query - some field might still be restricted
          logger.error(
            'Fireflies API rejected the minimal free query. This may indicate: ' +
            '1) The transcript ID is invalid, or ' +
            '2) Your API key does not have access to this transcript, or ' +
            '3) An unexpected API restriction : open an issue'
          );
        }
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

    // immediate_with_retry: retry with linear backoff
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
    const categories = analytics?.categories as Record<string, number> | undefined;
    const speakersAnalytics = analytics?.speakers as Array<Record<string, unknown>> | undefined;
    const meetingInfo = transcript.meeting_info as Record<string, unknown> | undefined;

    // Transform sentences array
    const rawSentences = transcript.sentences as Array<Record<string, unknown>> | undefined;
    const sentences = rawSentences?.map(s => ({
      index: (s.index as number) || 0,
      speaker_name: (s.speaker_name as string) || 'Unknown',
      text: (s.text as string) || '',
      start_time: (s.start_time as string) || '0',
      end_time: (s.end_time as string) || '0',
      ai_filters: s.ai_filters as { task?: boolean; question?: boolean; sentiment?: string } | undefined,
    }));

    // Transform speaker analytics
    const speakers = speakersAnalytics?.map(sp => ({
      speaker_id: (sp.speaker_id as string) || '',
      name: (sp.name as string) || 'Unknown',
      duration: (sp.duration as number) || 0,
      word_count: (sp.word_count as number) || 0,
      longest_monologue: (sp.longest_monologue as number) || 0,
      filler_words: (sp.filler_words as number) || 0,
      questions: (sp.questions as number) || 0,
      words_per_minute: (sp.words_per_minute as number) || 0,
    }));

    return {
      id: (transcript.id as string) || meetingId,
      title: (transcript.title as string) || 'Untitled Meeting',
      date: dateString,
      duration: (transcript.duration as number) || 0,
      participants: this.extractAllParticipants(transcript),
      organizer_email: transcript.organizer_email as string | undefined,
      sentences,
      summary: {
        // action_items can be string or array - normalize to array
        action_items: Array.isArray(summary?.action_items)
          ? summary.action_items as string[]
          : (typeof summary?.action_items === 'string' && summary.action_items.trim()
             ? summary.action_items.split('\n').filter((item: string) => item.trim())
             : []),
        overview: (summary?.overview as string) || '',
        notes: summary?.notes as string | undefined,
        gist: summary?.gist as string | undefined,
        bullet_gist: summary?.bullet_gist as string | undefined,
        short_summary: summary?.short_summary as string | undefined,
        short_overview: summary?.short_overview as string | undefined,
        outline: summary?.outline as string | undefined,
        shorthand_bullet: summary?.shorthand_bullet as string | undefined,
        keywords: summary?.keywords as string[] | undefined,
        topics_discussed: summary?.topics_discussed as string[] | undefined,
        meeting_type: summary?.meeting_type as string | undefined,
        transcript_chapters: summary?.transcript_chapters as string[] | undefined,
      },
      analytics: (sentiments || categories || speakers) ? {
        sentiments: sentiments ? {
          positive_pct: sentiments.positive_pct || 0,
          negative_pct: sentiments.negative_pct || 0,
          neutral_pct: sentiments.neutral_pct || 0,
        } : undefined,
        categories: categories ? {
          questions: categories.questions || 0,
          tasks: categories.tasks || 0,
          metrics: categories.metrics || 0,
          date_times: categories.date_times || 0,
        } : undefined,
        speakers,
      } : undefined,
      meeting_info: meetingInfo ? {
        summary_status: meetingInfo.summary_status as string | undefined,
      } : undefined,
      // URLs by plan availability:
      transcript_url: (transcript.transcript_url as string) || `https://app.fireflies.ai/view/${meetingId}`,
      audio_url: transcript.audio_url as string | undefined,     // Pro+
      video_url: transcript.video_url as string | undefined,     // Business+
      meeting_link: transcript.meeting_link as string | undefined, // All plans
      summary_status: (meetingInfo?.summary_status as string) || (transcript.summary_status as string) || undefined,
    };
  }

  private async executeTranscriptListQuery(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<Array<Record<string, unknown>>> {
    const response = await fetch('https://api.fireflies.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Fireflies transcripts request failed: ${response.status} ${errorBody}`);
    }

    const json = await response.json() as {
      data?: { transcripts?: Array<Record<string, unknown>> };
      errors?: Array<{ message?: string }>;
    };

    if (json.errors && json.errors.length > 0) {
      const message = json.errors[0]?.message || 'Unknown error';
      throw new Error(`Fireflies API error: ${message}`);
    }

    return json.data?.transcripts ?? [];
  }

  private normalizeDate(dateValue: unknown): string | undefined {
    if (!dateValue) {
      return undefined;
    }

    if (typeof dateValue === 'number') {
      return new Date(dateValue).toISOString();
    }

    if (typeof dateValue === 'string') {
      const parsed = Number(dateValue);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString();
      }
      return dateValue;
    }

    return undefined;
  }
}

