/* eslint-disable no-console */
import { FirefliesApiClient } from './fireflies-api-client';
import { MeetingFormatter } from './formatters';
import { TwentyCrmService } from './twenty-crm-service';
import type { FirefliesWebhookPayload, ProcessResult } from './types';
import { getApiUrl, getSummaryFetchConfig, shouldAutoCreateContacts } from './utils';
import {
  getWebhookSecretFingerprint,
  isValidFirefliesPayload,
  verifyWebhookSignature
} from './webhook-validator';

declare const process: { env: Record<string, string | undefined> };

export class WebhookHandler {
  private debug: string[] = [];
  private isTestEnvironment: boolean;

  constructor() {
    this.isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
  }

  async handle(params: unknown, headers?: Record<string, string>): Promise<ProcessResult> {
    const result: ProcessResult = {
      success: false,
      noteIds: [],
      newContacts: [],
      errors: [],
    };

    try {
      this.logDebug('[fireflies] invoked');
      this.logDebug(`[fireflies] apiUrl=${getApiUrl()}`);

      // 0) Validate environment configuration
      const firefliesApiKey = process.env.FIREFLIES_API_KEY || '';
      const twentyApiKey = process.env.TWENTY_API_KEY || '';

      if (!firefliesApiKey) {
        this.logError('[fireflies] FIREFLIES_API_KEY not configured');
        throw new Error('FIREFLIES_API_KEY environment variable is required');
      }
      if (!twentyApiKey) {
        this.logError('[fireflies] TWENTY_API_KEY not configured');
        throw new Error('TWENTY_API_KEY environment variable is required');
      }

      // 1) Parse and validate webhook payload and extract headers if wrapped together
      const { payload, extractedHeaders } = this.parsePayload(params);
      const finalHeaders = extractedHeaders || headers;

      this.logDebug(`[fireflies] payload meetingId=${payload.meetingId} eventType="${payload.eventType}"`);

      // 2) Verify webhook signature
      const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET || '';
      const secretFingerprint = getWebhookSecretFingerprint(webhookSecret);
      this.logDebug(`[fireflies] webhook secret fingerprint=${secretFingerprint}`);

      this.verifySignature(payload, finalHeaders, webhookSecret);
      this.logDebug('[fireflies] signature verification: ok');

      // 3) Fetch meeting data from Fireflies
      const summaryConfig = getSummaryFetchConfig();
      this.logDebug(`[fireflies] summary strategy: ${summaryConfig.strategy} (retryAttempts=${summaryConfig.retryAttempts}, retryDelay=${summaryConfig.retryDelay}ms)`);
      this.logDebug(`[fireflies] fetching meeting data from Fireflies API`);

      const firefliesClient = new FirefliesApiClient(firefliesApiKey);
      const { data: meetingData, summaryReady } = await firefliesClient.fetchMeetingDataWithRetry(
        payload.meetingId,
        summaryConfig
      );

      this.logDebug(`[fireflies] meeting data fetched: title="${meetingData.title}" summaryReady=${summaryReady}`);

      result.summaryReady = summaryReady;
      result.summaryPending = !summaryReady;

      // Extract business intelligence
      if (summaryReady) {
        result.actionItemsCount = meetingData.summary.action_items.length;
        result.keyTopics = meetingData.summary.topics_discussed;
        result.meetingType = meetingData.summary.meeting_type;

        if (meetingData.analytics?.sentiments) {
          const sentiments = meetingData.analytics.sentiments;
          result.sentimentScore = sentiments.positive_pct / 100;
        }
      }

      // 4) Check for duplicate meetings
      const twentyService = new TwentyCrmService(
        twentyApiKey,
        getApiUrl()
      );

      const existingMeeting = await twentyService.findExistingMeeting(meetingData.title);
      if (existingMeeting) {
        this.logDebug(`[fireflies] meeting already exists id=${existingMeeting.id}`);
        result.success = true;
        result.meetingId = existingMeeting.id;
        result.debug = this.debug;
        return result;
      }
      this.logDebug('[fireflies] no existing meeting found, proceeding');

      // 5) Match participants to existing contacts
      this.logDebug(`[fireflies] total participants from API: ${meetingData.participants.length}`);
      meetingData.participants.forEach((p, idx) => {
        this.logDebug(`[fireflies] participant ${idx + 1}: name="${p.name}" email="${p.email || 'none'}"`);
      });

      const { matchedContacts, unmatchedParticipants } = await twentyService.matchParticipantsToContacts(
        meetingData.participants
      );
      this.logDebug(`[fireflies] matched=${matchedContacts.length} unmatched=${unmatchedParticipants.length}`);

      unmatchedParticipants.forEach((p, idx) => {
        this.logDebug(`[fireflies] unmatched ${idx + 1}: name="${p.name}" email="${p.email || 'none'}"`);
      });

      // 6) Optionally create contacts
      const autoCreate = shouldAutoCreateContacts();
      const newContactIds = autoCreate
        ? await twentyService.createContactsForUnmatched(unmatchedParticipants)
        : [];
      result.newContacts = newContactIds;
      this.logDebug(`[fireflies] autoCreate=${autoCreate} createdContacts=${newContactIds.length}`);

      // 7) Create note first (so we can link to it from the meeting)
      const allContactIds = [...matchedContacts.map(({ id }) => id), ...newContactIds];
      const noteBody = MeetingFormatter.formatNoteBody(meetingData);
      const noteId = await twentyService.createNoteOnly(
        `Meeting: ${meetingData.title}`,
        noteBody
      );
      result.noteIds = [noteId];
      this.logDebug(`[fireflies] created note id=${noteId}`);

      // 8) Create meeting with direct relationship to the note
      const meetingInput = MeetingFormatter.toMeetingCreateInput(meetingData, noteId);
      this.logDebug(`[fireflies] meeting duration: ${meetingData.duration} min (raw from API) → ${meetingInput.duration} min (rounded)`);
      result.meetingId = await twentyService.createMeeting(meetingInput);
      this.logDebug(`[fireflies] created meeting id=${result.meetingId} with noteId=${noteId}`);

      // 9) Link note to participants (Meeting link is handled via the relation field)
      await this.linkNoteToParticipants(
        twentyService,
        noteId,
        allContactIds
      );
      this.logDebug(`[fireflies] linked note to ${allContactIds.length} participants`);

      result.success = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logError(`[fireflies] error: ${message}`);
      result.errors?.push(message);

      // Try to create a failed meeting record for tracking
      await this.createFailedMeetingRecord(params, message);
    }

    result.debug = this.debug;
    return result;
  }

  private parsePayload(params: unknown): { payload: FirefliesWebhookPayload; extractedHeaders?: Record<string, string> } {
    let normalizedParams = params;
    let extractedHeaders: Record<string, string> | undefined;

    // Handle string-encoded params
    if (typeof normalizedParams === 'string') {
      this.logDebug(`[fireflies] received params as string length=${normalizedParams.length}`);
      try {
        const parsed = JSON.parse(normalizedParams);
        normalizedParams = parsed;
        if (parsed && typeof parsed === 'object') {
          const parsedKeys = Object.keys(parsed as Record<string, unknown>);
          this.logDebug(`[fireflies] parsed params keys: ${parsedKeys.join(',') || 'none'}`);
        }
      } catch (parseError) {
        this.logError(`[fireflies] error parsing string params: ${String(parseError)}`);
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
        this.logDebug(`[fireflies] extracted headers from wrapper: ${headerKeys.join(',')}`);
      }

      const wrapperKeys = ['params', 'payload', 'body', 'data', 'event'];
      for (const key of wrapperKeys) {
        const candidate = wrapper[key];
        if (isValidFirefliesPayload(candidate)) {
          this.logDebug(`[fireflies] detected payload under wrapper key "${key}"`);
          payload = candidate as FirefliesWebhookPayload;
          break;
        }
      }
    }

    if (!payload) {
      this.logError('[fireflies] error: Invalid or missing webhook payload');
      throw new Error('Invalid or missing webhook payload');
    }

    // Log payload keys for debugging
    const payloadRecord = payload as Record<string, unknown>;
    const payloadKeys = Object.keys(payloadRecord);
    if (payloadKeys.length > 0) {
      this.logDebug(`[fireflies] payload keys: ${payloadKeys.join(',')}`);
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
      this.logDebug(`[fireflies] header keys: ${headerKeys.join(',')}`);
    }

    const headerSignature = Object.entries(normalizedHeaders).find(
      ([key]) => key.toLowerCase() === 'x-hub-signature',
    )?.[1];

    const payloadRecord = payload as Record<string, unknown>;
    const payloadSignature =
      typeof payloadRecord['x-hub-signature'] === 'string'
        ? (payloadRecord['x-hub-signature'] as string)
        : undefined;

    if (payloadSignature) {
      this.logDebug('[fireflies] found signature inside payload');
    }

    const signature =
      (typeof headerSignature === 'string' ? headerSignature : undefined) || payloadSignature;

    const body = typeof normalizedHeaders['body'] === 'string'
      ? normalizedHeaders['body']
      : JSON.stringify(payloadRecord);

    const signatureCheck = verifyWebhookSignature(body, signature, webhookSecret);
    if (!signatureCheck.isValid) {
      this.logDebug(
        `[fireflies] signature check failed. headerPresent=${Boolean(
          headerSignature,
        )} payloadSignaturePresent=${Boolean(payloadSignature)}`,
      );
      if (signature) {
        this.logDebug(`[fireflies] provided signature=${signature}`);
      } else {
        this.logDebug('[fireflies] provided signature=undefined');
      }
      this.logDebug(
        `[fireflies] computed signature=${signatureCheck.computedSignature ?? 'unavailable'}`,
      );
      this.logError('[fireflies] error: Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }
  }

  private async linkNoteToParticipants(
    twentyService: TwentyCrmService,
    noteId: string,
    contactIds: string[]
  ): Promise<void> {
    // Create Note-Person links for each participant
    for (const contactId of contactIds) {
      try {
        await twentyService.createNoteTarget(noteId, contactId);
        this.logDebug(`[fireflies] linked note ${noteId} to person ${contactId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logError(`[fireflies] failed to link note to person ${contactId}: ${message}`);
        // Continue with other participants
      }
    }
  }

  private logDebug(message: string): void {
    this.debug.push(message);
    if (!this.isTestEnvironment) {
      console.log(message);
    }
  }

  private logError(message: string): void {
    this.debug.push(message);
    if (!this.isTestEnvironment) {
      console.error(message);
    }
  }

  private async createFailedMeetingRecord(params: unknown, error: string): Promise<void> {
    try {
      const twentyApiKey = process.env.TWENTY_API_KEY || '';
      if (!twentyApiKey) {
        this.logDebug('[fireflies] Cannot create failed meeting record: TWENTY_API_KEY not configured');
        return;
      }

      // Try to extract meeting ID and title from the params
      let meetingId = 'unknown';
      let meetingTitle = 'Unknown Meeting';

      const { payload } = this.parsePayload(params);
      if (payload?.meetingId) {
        meetingId = payload.meetingId;

        // Try to get meeting title from Fireflies API if possible
        const firefliesApiKey = process.env.FIREFLIES_API_KEY || '';
        if (firefliesApiKey) {
          try {
            const firefliesClient = new FirefliesApiClient(firefliesApiKey);
            const meetingData = await firefliesClient.fetchMeetingData(meetingId);
            meetingTitle = meetingData.title || meetingTitle;
          } catch (fetchError) {
            this.logDebug(`[fireflies] Could not fetch meeting title: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
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
      this.logDebug(`[fireflies] Created failed meeting record: ${failedMeetingId}`);
    } catch (recordError) {
      // Don't throw here - we don't want to break the original error handling
      this.logError(`[fireflies] Failed to create failed meeting record: ${recordError instanceof Error ? recordError.message : 'Unknown error'}`);
    }
  }
}

