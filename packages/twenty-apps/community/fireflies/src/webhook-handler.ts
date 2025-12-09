import { FirefliesApiClient } from './fireflies-api-client';
import { MeetingFormatter } from './formatters';
import { clearAllCapturedLogs, createLogger, getAllCapturedLogs } from './logger';
import { TwentyCrmService } from './twenty-crm-service';
import type { FirefliesWebhookPayload, ProcessResult } from './types';
import { getApiUrl, getFirefliesPlan, getSummaryFetchConfig, shouldAutoCreateContacts } from './utils';
import {
  getWebhookSecretFingerprint,
  isValidFirefliesPayload,
  verifyWebhookSignature
} from './webhook-validator';

declare const process: { env: Record<string, string | undefined> };

export class WebhookHandler {
  private debug: string[] = [];
  private logger: ReturnType<typeof createLogger>;

  constructor() {
    this.logger = createLogger('fireflies');
  }

  private addDebugLogs(result: ProcessResult): ProcessResult {
    if (process.env.CAPTURE_LOGS === 'true') {
      const captured = getAllCapturedLogs();
      result.debug = [...this.debug, ...captured];
    } else {
      delete result.debug;
    }
    return result;
  }

  async handle(params: unknown, headers?: Record<string, string>): Promise<ProcessResult> {
    clearAllCapturedLogs();
    this.debug = [];

    const result: ProcessResult = {
      success: false,
      noteIds: [],
      newContacts: [],
      errors: [],
    };

    try {
      this.logger.debug('invoked');
      this.logger.debug(`apiUrl=${getApiUrl()}`);
      const paramKeys =
        params && typeof params === 'object'
          ? Object.keys(params as Record<string, unknown>)
          : [];
      this.debug.push(
        `paramsType=${typeof params}`,
        `paramKeys=${paramKeys.join(',') || 'none'}`
      );

      // 0) Validate environment configuration
      const firefliesApiKey = process.env.FIREFLIES_API_KEY || '';
      const twentyApiKey = process.env.TWENTY_API_KEY || '';

      if (!firefliesApiKey) {
        this.logger.critical('FIREFLIES_API_KEY not configured - this is a critical configuration error');
        throw new Error('FIREFLIES_API_KEY environment variable is required');
      }
      if (!twentyApiKey) {
        this.logger.critical('TWENTY_API_KEY not configured - this is a critical configuration error');
        throw new Error('TWENTY_API_KEY environment variable is required');
      }

      // 1) Parse and validate webhook payload and extract headers if wrapped together
      const { payload, extractedHeaders } = this.parsePayload(params);
      const finalHeaders = extractedHeaders || headers;

      this.logger.debug(`payload meetingId=${payload.meetingId} eventType="${payload.eventType}"`);

      // 2) Verify webhook signature
      const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET || '';
      const secretFingerprint = getWebhookSecretFingerprint(webhookSecret);
      this.logger.debug(`webhook secret fingerprint=${secretFingerprint}`);

      this.verifySignature(payload, finalHeaders, webhookSecret);
      this.logger.debug('signature verification: ok');

      // 3) Fetch meeting data from Fireflies
      const summaryConfig = getSummaryFetchConfig();
      const firefliesPlan = getFirefliesPlan();
      this.logger.debug(`summary strategy: ${summaryConfig.strategy} (retryAttempts=${summaryConfig.retryAttempts}, retryDelay=${summaryConfig.retryDelay}ms)`);
      this.logger.debug(`fetching meeting data from Fireflies API`);

      const firefliesClient = new FirefliesApiClient(firefliesApiKey);
      const { data: meetingData, summaryReady } = await firefliesClient.fetchMeetingDataWithRetry(
        payload.meetingId,
        summaryConfig,
        firefliesPlan
      );

      this.logger.debug(`meeting data fetched: title="${meetingData.title}" summaryReady=${summaryReady}`);

      result.summaryReady = summaryReady;
      result.summaryPending = !summaryReady;

      // Extract business intelligence
      if (summaryReady) {
        result.actionItemsCount = meetingData.summary.action_items.length;
        result.keyTopics = meetingData.summary.topics_discussed;
        result.meetingType = meetingData.summary.meeting_type;

        if (meetingData.analytics?.sentiments) {
          result.sentimentAnalysis = meetingData.analytics.sentiments;
        }
      }

      // 4) Check for duplicate meetings
      const twentyService = new TwentyCrmService(
        twentyApiKey,
        getApiUrl()
      );

      const existingMeetingById = await twentyService.findMeetingByFirefliesId(meetingData.id);
      if (existingMeetingById) {
        this.logger.debug(`meeting already exists by firefliesMeetingId id=${existingMeetingById.id}`);
        result.success = true;
        result.meetingId = existingMeetingById.id;
        return this.addDebugLogs(result);
      }

      const existingMeetingByTitle = await twentyService.findExistingMeeting(meetingData.title);
      if (existingMeetingByTitle) {
        this.logger.debug(`meeting already exists by title id=${existingMeetingByTitle.id}`);
        result.success = true;
        result.meetingId = existingMeetingByTitle.id;
        return this.addDebugLogs(result);
      }
      this.logger.debug('no existing meeting found, proceeding');

      // 5) Match participants to existing contacts
      this.logger.debug(`total participants from API: ${meetingData.participants.length}`);
      meetingData.participants.forEach((p, idx) => {
        this.logger.debug(`participant ${idx + 1}: name="${p.name}" email="${p.email || 'none'}"`);
      });

      const { matchedContacts, unmatchedParticipants } = await twentyService.matchParticipantsToContacts(
        meetingData.participants
      );
      this.logger.debug(`matched=${matchedContacts.length} unmatched=${unmatchedParticipants.length}`);

      unmatchedParticipants.forEach((p, idx) => {
        this.logger.debug(`unmatched ${idx + 1}: name="${p.name}" email="${p.email || 'none'}"`);
      });

      // 6) Optionally create contacts
      const autoCreate = shouldAutoCreateContacts();
      const newContactIds = autoCreate
        ? await twentyService.createContactsForUnmatched(unmatchedParticipants)
        : [];
      result.newContacts = newContactIds;
      this.logger.debug(`autoCreate=${autoCreate} createdContacts=${newContactIds.length}`);

      // 7) Create note first (so we can link to it from the meeting)
      const allContactIds = [...matchedContacts.map(({ id }) => id), ...newContactIds];
      const noteBody = MeetingFormatter.formatNoteBody(meetingData);
      const noteId = await twentyService.createNoteOnly(
        `Meeting: ${meetingData.title}`,
        noteBody
      );
      result.noteIds = [noteId];
      this.logger.debug(`created note id=${noteId}`);

      // 8) Create meeting with direct relationship to the note
      const meetingInput = MeetingFormatter.toMeetingCreateInput(meetingData, noteId);
      this.logger.debug(`meeting duration: ${meetingData.duration} min (raw from API) → ${meetingInput.duration} min (rounded)`);
      result.meetingId = await twentyService.createMeeting(meetingInput);
      this.logger.debug(`created meeting id=${result.meetingId} with noteId=${noteId}`);

      // 9) Link note to participants (Meeting link is handled via the relation field)
      await this.linkNoteToParticipants(
        twentyService,
        noteId,
        allContactIds
      );
      this.logger.debug(`linked note to ${allContactIds.length} participants`);

      result.success = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`error: ${message}`);
      result.errors?.push(message);

      // Try to create a failed meeting record for tracking
      await this.createFailedMeetingRecord(params, message);
    }

    return this.addDebugLogs(result);
  }

  private parsePayload(params: unknown): { payload: FirefliesWebhookPayload; extractedHeaders?: Record<string, string> } {
    let normalizedParams = params;
    let extractedHeaders: Record<string, string> | undefined;

    // Handle string-encoded params
    if (typeof normalizedParams === 'string') {
      this.logger.debug(`received params as string length=${normalizedParams.length}`);
      try {
        const parsed = JSON.parse(normalizedParams);
        normalizedParams = parsed;
        if (parsed && typeof parsed === 'object') {
          const parsedKeys = Object.keys(parsed as Record<string, unknown>);
          this.logger.debug(`parsed params keys: ${parsedKeys.join(',') || 'none'}`);
        }
      } catch (parseError) {
        this.logger.error(`error parsing string params: ${String(parseError)}`);
        throw new Error('Invalid or missing webhook payload');
      }
    }

    // Handle wrapped payloads and extract headers if present
    let payload: FirefliesWebhookPayload | undefined;
    if (isValidFirefliesPayload(normalizedParams)) {
      payload = normalizedParams as FirefliesWebhookPayload;
    } else if (normalizedParams && typeof normalizedParams === 'object') {
      const wrapper = normalizedParams as Record<string, unknown>;

      // Extract headers if present in wrapper
      if (wrapper.headers && typeof wrapper.headers === 'object' && !Array.isArray(wrapper.headers)) {
        extractedHeaders = wrapper.headers as Record<string, string>;
        const headerKeys = Object.keys(extractedHeaders);
        this.logger.debug(`extracted headers from wrapper: ${headerKeys.join(',')}`);
      }

      const wrapperKeys = ['params', 'payload', 'body', 'data', 'event'];
      for (const key of wrapperKeys) {
        const candidate = wrapper[key];
        if (isValidFirefliesPayload(candidate)) {
          this.logger.debug(`detected payload under wrapper key "${key}"`);
          payload = candidate as FirefliesWebhookPayload;
          break;
        }
      }
    }

    if (!payload) {
      this.logger.error('error: Invalid or missing webhook payload');
      throw new Error('Invalid or missing webhook payload');
    }

    // Log payload keys for debugging
    const payloadRecord = payload as Record<string, unknown>;
    const payloadKeys = Object.keys(payloadRecord);
    if (payloadKeys.length > 0) {
      this.logger.debug(`payload keys: ${payloadKeys.join(',')}`);
    }

    return { payload, extractedHeaders };
  }

  private verifySignature(
    payload: FirefliesWebhookPayload,
    headers: Record<string, string> | undefined,
    webhookSecret: string
  ): void {
    // Extract headers
    const normalizedHeaders = headers || {};
    const headerKeys = Object.keys(normalizedHeaders);
    if (headerKeys.length > 0) {
      this.logger.debug(`header keys: ${headerKeys.join(',')}`);
    }
    this.debug.push(`headerKeys=${headerKeys.join(',') || 'none'}`);

    const headerSignature = Object.entries(normalizedHeaders).find(
      ([key]) => key.toLowerCase() === 'x-hub-signature',
    )?.[1];

    const payloadRecord = payload as Record<string, unknown>;
    const payloadSignature =
      typeof payloadRecord['x-hub-signature'] === 'string'
        ? (payloadRecord['x-hub-signature'] as string)
        : undefined;

    if (payloadSignature) {
      this.logger.debug('found signature inside payload');
    }

    const signature =
      (typeof headerSignature === 'string' ? headerSignature : undefined) || payloadSignature;

    const payloadForSignature =
      payloadSignature && 'x-hub-signature' in payloadRecord
        ? Object.fromEntries(
            Object.entries(payloadRecord).filter(
              ([key]) => key.toLowerCase() !== 'x-hub-signature',
            ),
          )
        : payloadRecord;

    const body =
      typeof normalizedHeaders['body'] === 'string'
        ? normalizedHeaders['body']
        : JSON.stringify(payloadForSignature);

    const signatureCheck = verifyWebhookSignature(body, signature, webhookSecret);
    if (!signatureCheck.isValid) {
      this.debug.push(
        `signatureProvided=${Boolean(signature)}`,
        `signatureMatched=${signatureCheck.isValid}`,
        `webhookSecretFingerprint=${getWebhookSecretFingerprint(webhookSecret)}`
      );
      this.logger.debug(
        `signature check failed. headerPresent=${Boolean(
          headerSignature,
        )} payloadSignaturePresent=${Boolean(payloadSignature)}`,
      );
      this.logger.debug(`provided signature present=${Boolean(signature)}`);
      this.logger.critical('Invalid webhook signature - potential security threat detected in production');
      throw new Error('Invalid webhook signature');
    }
  }

  private async linkNoteToParticipants(
    twentyService: TwentyCrmService,
    noteId: string,
    contactIds: string[]
  ): Promise<void> {
    for (const contactId of contactIds) {
      try {
        await twentyService.createNoteTarget(noteId, contactId);
        this.logger.debug(`linked note ${noteId} to person ${contactId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`failed to link note to person ${contactId}: ${message}`);
      }
    }
  }


  private async createFailedMeetingRecord(params: unknown, error: string): Promise<void> {
    try {
      const twentyApiKey = process.env.TWENTY_API_KEY || '';
      if (!twentyApiKey) {
        this.logger.debug('Cannot create failed meeting record: TWENTY_API_KEY not configured');
        return;
      }

      let meetingId = 'unknown';
      let meetingTitle = 'Unknown Meeting';

      const { payload } = this.parsePayload(params);
      if (payload?.meetingId) {
        meetingId = payload.meetingId;

        const firefliesApiKey = process.env.FIREFLIES_API_KEY || '';
        if (firefliesApiKey) {
          try {
            const firefliesClient = new FirefliesApiClient(firefliesApiKey);
            const meetingData = await firefliesClient.fetchMeetingData(meetingId);
            meetingTitle = meetingData.title || meetingTitle;
          } catch (fetchError) {
            this.logger.debug(
              `Could not fetch meeting title: ${
                fetchError instanceof Error ? fetchError.message : 'Unknown error'
              }`,
            );
          }
        }
      }

      const twentyService = new TwentyCrmService(twentyApiKey, getApiUrl());
      const failedMeetingData = MeetingFormatter.toFailedMeetingCreateInput(
        meetingId,
        meetingTitle,
        error
      );

      const failedMeetingId = await twentyService.createFailedMeeting(failedMeetingData);
      this.logger.debug(`Created failed meeting record: ${failedMeetingId}`);
    } catch (recordError) {
      this.logger.error(
        `Failed to create failed meeting record: ${
          recordError instanceof Error ? recordError.message : 'Unknown error'
        }`,
      );
    }
  }
}

