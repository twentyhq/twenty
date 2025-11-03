/* eslint-disable no-console */
import { createHash, createHmac } from 'crypto';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

declare const process: { env: Record<string, string | undefined> };


const toBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

export type FirefliesParticipant = {
  email: string;
  name: string;
};

// https://docs.fireflies.ai/graphql-api/webhooks#webhook-schema
export type FirefliesWebhookPayload = {
  meetingId: string;
  eventType: string; // "Transcription completed"
  clientReferenceId?: string;
};

// Rich meeting data fetched from Fireflies GraphQL API
export type FirefliesMeetingData = {
  id: string;
  title: string;
  date: string; // ISO 8601
  duration: number; // seconds
  participants: FirefliesParticipant[];
  organizer_email?: string;

  // Summary-focused data
  summary: {
    action_items: string[];
    keywords: string[];
    overview: string;
    gist: string;
    topics_discussed: string[];
    meeting_type?: string;
    bullet_gist?: string;
  };

  // Analytics data
  analytics?: {
    sentiments?: {
      positive_pct: number;
      negative_pct: number;
      neutral_pct: number;
    };
  };

  // Links instead of full content
  transcript_url: string;
  recording_url?: string;

  // Processing status
  summary_status?: string;
};

// Summary fetching strategy
export type SummaryStrategy = 'immediate_only' | 'immediate_with_retry' | 'delayed_polling' | 'basic_only';

export type SummaryFetchConfig = {
  strategy: SummaryStrategy;
  retryAttempts: number;
  retryDelay: number;
  pollInterval: number;
  maxPolls: number;
};

export type ProcessResult = {
  success: boolean;
  meetingId?: string;
  noteIds?: string[];
  newContacts?: string[];
  errors?: string[];
  debug?: string[];

  // Summary processing status
  summaryReady?: boolean;
  summaryPending?: boolean;
  enhancementScheduled?: boolean;

  // Business intelligence extracted
  actionItemsCount?: number;
  sentimentScore?: number;
  meetingType?: string;
  keyTopics?: string[];
};

type GraphQLResponse<T> = { data: T };

type IdNode = { id: string };

type FindMeetingResponse = {
  meetings: { edges: Array<{ node: IdNode }> };
};

type FindPeopleResponse = {
  people: { edges: Array<{ node: { id: string; emails: { primaryEmail: string } } }> };
};

type CreatePersonResponse = { createPerson: { id: string } };
type CreateNoteResponse = { createNote: { id: string } };
type CreateMeetingResponse = { createMeeting: { id: string } };

const getApiUrl = (): string => {
  // Prefer SERVER_URL if present (running inside server container), fallback to localhost
  return process.env.SERVER_URL || 'http://localhost:3000';
};

type SignatureVerificationResult = {
  isValid: boolean;
  computedSignature?: string;
};

const verifyWebhookSignature = (
  body: string,
  signature: string | undefined,
  secret: string
): SignatureVerificationResult => {
  if (!signature) {
    return { isValid: false };
  }

  try {
    const computedSignature = createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

    const expectedSignature = `sha256=${computedSignature}`;
    return {
      isValid: expectedSignature === signature,
      computedSignature: expectedSignature,
    };
  } catch (error) {
    console.error('[fireflies] Signature verification error:', error);
    return { isValid: false, computedSignature: undefined };
  }
};

// Check if summary data is ready
const isSummaryReady = (meetingData: FirefliesMeetingData): boolean => {
  return (
    (meetingData.summary?.action_items?.length > 0) ||
    (meetingData.summary?.keywords?.length > 0) ||
    (meetingData.summary?.overview?.length > 0) ||
    meetingData.summary_status === 'completed'
  );
};

// Fetch meeting data from Fireflies GraphQL API
const fetchFirefliesMeetingData = async (
  meetingId: string,
  options?: { timeout?: number }
): Promise<FirefliesMeetingData> => {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) {
    throw new Error('FIREFLIES_API_KEY environment variable is required');
  }

  const query = `
    query GetTranscript($transcriptId: String!) {
      transcript(id: $transcriptId) {
        id
        title
        date
        duration
        participants {
          name
          email
        }
        organizer_email
        summary {
          action_items
          keywords
          overview
          gist
          topics_discussed
          meeting_type
          bullet_gist
        }
        sentiments {
          positive_pct
          negative_pct
          neutral_pct
        }
        transcript_url
        video_url
      }
    }
  `;

  const controller = new AbortController();
  const timeoutId = options?.timeout ? setTimeout(() => controller.abort(), options.timeout) : null;

  try {
    const response = await fetch('https://api.fireflies.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        variables: { transcriptId: meetingId },
      }),
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Fireflies API request failed with status ${response.status}`);
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

    // Transform to our internal format
    return {
      id: transcript.id || meetingId,
      title: transcript.title || 'Untitled Meeting',
      date: transcript.date || new Date().toISOString(),
      duration: transcript.duration || 0,
      participants: transcript.participants || [],
      organizer_email: transcript.organizer_email,
      summary: {
        action_items: transcript.summary?.action_items || [],
        keywords: transcript.summary?.keywords || [],
        overview: transcript.summary?.overview || '',
        gist: transcript.summary?.gist || '',
        topics_discussed: transcript.summary?.topics_discussed || [],
        meeting_type: transcript.summary?.meeting_type,
        bullet_gist: transcript.summary?.bullet_gist,
      },
      analytics: transcript.sentiments ? {
        sentiments: {
          positive_pct: transcript.sentiments.positive_pct || 0,
          negative_pct: transcript.sentiments.negative_pct || 0,
          neutral_pct: transcript.sentiments.neutral_pct || 0,
        }
      } : undefined,
      transcript_url: transcript.transcript_url || '',
      recording_url: transcript.video_url,
      summary_status: transcript.summary_status,
    };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
};

// Fetch with retry logic for summary data
const fetchMeetingDataWithRetry = async (
  meetingId: string,
  config: SummaryFetchConfig
): Promise<{ data: FirefliesMeetingData; summaryReady: boolean }> => {
  // immediate_only: single attempt, no retries
  if (config.strategy === 'immediate_only') {
    const meetingData = await fetchFirefliesMeetingData(meetingId, { timeout: 10000 });
    return { data: meetingData, summaryReady: isSummaryReady(meetingData) };
  }

  // immediate_with_retry: retry with exponential backoff
  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      const meetingData = await fetchFirefliesMeetingData(meetingId, { timeout: 10000 });

      if (isSummaryReady(meetingData)) {
        return { data: meetingData, summaryReady: true };
      }

      if (attempt < config.retryAttempts) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
      } else {
        // Return partial data on last attempt
        return { data: meetingData, summaryReady: false };
      }
    } catch (error) {
      if (attempt === config.retryAttempts) {
        throw error;
      }
      // Retry on error
      await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
    }
  }

  throw new Error('Failed to fetch meeting data after retries');
};

const gqlRequest = async <T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> => {
  const apiKey = process.env.TWENTY_API_KEY;
  if (!apiKey) {
    throw new Error('TWENTY_API_KEY environment variable is required');
  }

  const url = `${getApiUrl()}/graphql`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      let errorMessage = `GraphQL request failed with status ${res.status}`;
      try {
        const errorText = await res.text();
        if (errorText) {
          errorMessage += `: ${errorText}`;
        }
      } catch {
        // Ignore error when reading response body
      }
      throw new Error(errorMessage);
    }

    const json = await res.json() as GraphQLResponse<T> & {
      errors?: Array<{ message?: string; extensions?: Record<string, unknown> }>
    };

    if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      const firstError = json.errors[0];
      const errorMessage = firstError?.message || 'GraphQL error';
      const errorCode = firstError?.extensions?.code as string | undefined;

      if (errorCode) {
        throw new Error(`${errorMessage} (Code: ${errorCode})`);
      }
      throw new Error(errorMessage);
    }

    return json;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${String(error)}`);
  }
};

// Validate minimal webhook payload from Fireflies
const isValidFirefliesPayload = (
  params: unknown
): params is FirefliesWebhookPayload => {
  if (!params || typeof params !== 'object') return false;
  const payload = params as Record<string, unknown>;

  // Validate required fields for minimal webhook format
  if (typeof payload.meetingId !== 'string' || payload.meetingId === '') {
    return false;
  }

  if (typeof payload.eventType !== 'string' || payload.eventType === '') {
    return false;
  }

  // clientReferenceId is optional
  if (payload.clientReferenceId !== undefined && typeof payload.clientReferenceId !== 'string') {
    return false;
  }

  return true;
};

export const main = async (
  params: unknown,
  headers?: Record<string, string>
): Promise<ProcessResult> => {

  const debug: string[] = [];
  const isDebugEnabled = toBoolean(process.env.DEBUG_LOGS, false);

  const logDebug = (message: string) => {
    debug.push(message);
    if (isDebugEnabled) {
      console.log(message);
    }
  };

  const logError = (message: string) => {
    debug.push(message);
    console.error(message);
  };

  const _logWarn = (message: string) => {
    debug.push(message);
    console.warn(message);
  };

  const result: ProcessResult = {
    success: false,
    noteIds: [],
    newContacts: [],
    errors: [],
  };

  // Ensure we NEVER throw any errors that could cause 500
  try {
    logDebug('[fireflies] invoked');
    logDebug(`[fireflies] apiUrl=${getApiUrl()}`);

    const rawParams = params;
    let normalizedParams = rawParams;

    if (typeof normalizedParams === 'string') {
      logDebug(`[fireflies] received params as string length=${normalizedParams.length}`);
      try {
        const parsed = JSON.parse(normalizedParams);
        normalizedParams = parsed;
        if (parsed && typeof parsed === 'object') {
          const parsedKeys = Object.keys(parsed as Record<string, unknown>);
          logDebug(`[fireflies] parsed params keys: ${parsedKeys.join(',') || 'none'}`);
        }
      } catch (parseError) {
        logError(`[fireflies] error parsing string params: ${String(parseError)}`);
        throw new Error('Invalid or missing webhook payload');
      }
    }

    // 1) Validate webhook payload structure (supports wrapped payloads)
    let payload: FirefliesWebhookPayload | undefined;
    if (isValidFirefliesPayload(normalizedParams)) {
      payload = normalizedParams as FirefliesWebhookPayload;
    } else if (normalizedParams && typeof normalizedParams === 'object') {
      const wrapper = normalizedParams as Record<string, unknown>;
      const wrapperKeys = ['params', 'payload', 'body', 'data', 'event'];
      for (const key of wrapperKeys) {
        const candidate = wrapper[key];
        if (isValidFirefliesPayload(candidate)) {
          logDebug(`[fireflies] detected payload under wrapper key "${key}"`);
          payload = candidate;
          break;
        }
        if (typeof candidate === 'string') {
          try {
            const parsed = JSON.parse(candidate);
            if (isValidFirefliesPayload(parsed)) {
              logDebug(`[fireflies] parsed payload from string wrapper key "${key}"`);
              payload = parsed;
              break;
            }
          } catch {
            // Ignore parse failure for non-JSON strings
          }
        }
      }
    }

    if (!payload) {
      if (normalizedParams && typeof normalizedParams === 'object') {
        const candidateKeys = Object.keys(normalizedParams as Record<string, unknown>);
        logDebug(`[fireflies] payload wrapper keys detected: ${candidateKeys.join(',') || 'none'}`);
      } else {
        logDebug('[fireflies] payload wrapper keys detected: none (non-object params)');
      }
      logError('[fireflies] error: Invalid or missing webhook payload');
      throw new Error('Invalid or missing webhook payload');
    }
    logDebug(`[fireflies] payload meetingId=${payload.meetingId} eventType="${payload.eventType}"`);

    // 2) Verify webhook signature using HMAC
    const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logError('[fireflies] error: FIREFLIES_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
    }

    try {
      const secretFingerprint = createHash('sha256')
        .update(webhookSecret)
        .digest('hex')
        .slice(0, 8);
      logDebug(`[fireflies] webhook secret fingerprint=${secretFingerprint}`);
    } catch (fingerprintError) {
      logDebug(`[fireflies] webhook secret fingerprint error=${String(fingerprintError)}`);
    }

    const payloadRecord = payload as Record<string, unknown>;
    const payloadKeys = Object.keys(payloadRecord);
    if (payloadKeys.length > 0) {
      logDebug(`[fireflies] payload keys: ${payloadKeys.join(',')}`);
    }

    const normalizedHeaders: Record<string, string> | undefined = (() => {
      if (headers) {
        return headers;
      }
      if (normalizedParams && typeof normalizedParams === 'object') {
        const possibleHeaders = (normalizedParams as Record<string, unknown>).headers;
        if (possibleHeaders && typeof possibleHeaders === 'object' && !Array.isArray(possibleHeaders)) {
          const entries = Object.entries(possibleHeaders).reduce<Record<string, string>>((acc, [key, value]) => {
            if (typeof value === 'string') {
              acc[key] = value;
            } else if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {});
          return Object.keys(entries).length > 0 ? entries : undefined;
        }
      }
      return undefined;
    })();

    if (normalizedHeaders) {
      const headerKeys = Object.keys(normalizedHeaders);
      if (headerKeys.length > 0) {
        logDebug(`[fireflies] header keys: ${headerKeys.join(',')}`);
      }
    }

    const headerSignature = Object.entries(normalizedHeaders ?? {}).find(
      ([key]) => key.toLowerCase() === 'x-hub-signature',
    )?.[1];

    const payloadSignature =
      typeof payloadRecord['x-hub-signature'] === 'string'
        ? (payloadRecord['x-hub-signature'] as string)
        : undefined;

    if (payloadSignature) {
      logDebug('[fireflies] found signature inside payload');
    }

    const signature =
      (typeof headerSignature === 'string' ? headerSignature : undefined) || payloadSignature;

    let body: string;
    if (normalizedHeaders && typeof normalizedHeaders['body'] === 'string') {
      body = normalizedHeaders['body'];
    } else {
      body = JSON.stringify(payloadRecord);
    }

    const signatureCheck = verifyWebhookSignature(body, signature, webhookSecret);
    if (!signatureCheck.isValid) {
      logDebug(
        `[fireflies] signature check failed. headerPresent=${Boolean(
          headerSignature,
        )} payloadSignaturePresent=${Boolean(payloadSignature)}`,
      );
      if (signature) {
        logDebug(`[fireflies] provided signature=${signature}`);
      } else {
        logDebug('[fireflies] provided signature=undefined');
      }
      let resolvedComputedSignature = signatureCheck.computedSignature;
      if (!resolvedComputedSignature) {
        try {
          const fallback = createHmac('sha256', webhookSecret)
            .update(body, 'utf8')
            .digest('hex');
          resolvedComputedSignature = `sha256=${fallback}`;
        } catch (fallbackError) {
          logDebug(`[fireflies] recompute signature error=${String(fallbackError)}`);
        }
      }
      logDebug(
        `[fireflies] computed signature=${resolvedComputedSignature ?? 'unavailable'}`,
      );
      logDebug(
        `[fireflies] signature body source=${
          normalizedHeaders && typeof normalizedHeaders['body'] === 'string'
            ? 'headers.body'
            : 'stringified payload'
        }`,
      );
      logDebug(`[fireflies] signature body=${body}`);
      logError('[fireflies] error: Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }
    logDebug('[fireflies] signature verification: ok');

    // 3) Get summary fetch configuration
    const summaryStrategy: SummaryStrategy = (process.env.FIREFLIES_SUMMARY_STRATEGY as SummaryStrategy) || 'immediate_with_retry';
    const summaryConfig: SummaryFetchConfig = {
      strategy: summaryStrategy,
      retryAttempts: parseInt(process.env.FIREFLIES_RETRY_ATTEMPTS || '30', 10),
      retryDelay: parseInt(process.env.FIREFLIES_RETRY_DELAY || '30000', 10),
      pollInterval: parseInt(process.env.FIREFLIES_POLL_INTERVAL || '60000', 10),
      maxPolls: parseInt(process.env.FIREFLIES_MAX_POLLS || '15', 10),
    };
    logDebug(`[fireflies] summary strategy: ${summaryStrategy}`);

    // 4) Fetch meeting data from Fireflies GraphQL API
    logDebug(`[fireflies] fetching meeting data from Fireflies API`);
    const { data: meetingData, summaryReady } = await fetchMeetingDataWithRetry(
      payload.meetingId,
      summaryConfig
    );
    logDebug(`[fireflies] meeting data fetched: title="${meetingData.title}" summaryReady=${summaryReady}`);

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

    // 5) Check for duplicate meetings
    const existingMeeting = await findExistingMeeting(meetingData.title);
    if (existingMeeting) {
      logDebug(`[fireflies] meeting already exists id=${existingMeeting.id}`);
      result.success = true;
      result.meetingId = existingMeeting.id;
      result.debug = debug;
      return result;
    }
    logDebug('[fireflies] no existing meeting found, proceeding');

    // 6) Match participants to existing contacts
    const { matchedContacts, unmatchedParticipants } = await matchParticipantsToContacts(meetingData.participants);
    logDebug(`[fireflies] matched=${matchedContacts.length} unmatched=${unmatchedParticipants.length}`);

    // 7) Optionally create contacts
    const autoCreate = toBoolean(process.env.AUTO_CREATE_CONTACTS, true);
    const newContactIds = autoCreate ? await createContactsForUnmatched(unmatchedParticipants) : [];
    result.newContacts = newContactIds;
    logDebug(`[fireflies] autoCreate=${autoCreate} createdContacts=${newContactIds.length}`);

    // 8) Decide record type based on participant count
    const isOneOnOne = meetingData.participants.length === 2;
    logDebug(`[fireflies] isOneOnOne=${isOneOnOne}`);

    if (isOneOnOne) {
      const contactIds: string[] = [...matchedContacts.map(({ id }) => id), ...newContactIds];
      result.noteIds = await createNotesForParticipants(meetingData, contactIds);
      logDebug(`[fireflies] created notes count=${result.noteIds.length} ids=${result.noteIds.join(',')}`);
    } else {
      const attendeeIds: string[] = [...matchedContacts.map(({ id }) => id), ...newContactIds];
      result.meetingId = await createMeetingRecord(meetingData, attendeeIds);
      logDebug(`[fireflies] created meeting id=${result.meetingId}`);
    }

    result.success = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logError(`[fireflies] error: ${message}`);
    result.errors?.push(message);
  }

  // Final safety check - ensure result is always returned
  try {
    result.debug = debug;
    return result;
  } catch (finalError) {
    // Absolute fallback if something goes wrong with result construction
    console.error('[fireflies] Critical error in result construction:', finalError);
    return {
      success: false,
      noteIds: [],
      newContacts: [],
      errors: ['Critical error in webhook processing'],
      debug: ['Critical error occurred']
    };
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '2d3ea303-667c-4bbe-9e3d-db6ffb9d6c74',
  name: 'receive-fireflies-notes',
  description:
    'Receives Fireflies webhooks, fetches meeting summaries, and stores them in Twenty.',
  timeoutSeconds: 30,
  triggers: [
    {
      universalIdentifier: 'a2117dc1-7674-4c7e-9d70-9feb9820e9e8',
      type: 'route',
      path: '/webhook/fireflies',
      httpMethod: 'POST',
      isAuthRequired: true,
    },
  ],
};

const findExistingMeeting = async (title: string): Promise<IdNode | undefined> => {
  const query = `
    query FindMeeting($title: String!) {
      meetings(filter: { name: { eq: $title } }) {
        edges { node { id } }
      }
    }
  `;

  const variables = { title } satisfies Record<string, unknown>;
  const response = await gqlRequest<FindMeetingResponse>(query, variables);
  return response.data?.meetings?.edges?.[0]?.node;
};

const matchParticipantsToContacts = async (
  participants: FirefliesParticipant[],
): Promise<{
  matchedContacts: Array<{ id: string; email: string }>;
  unmatchedParticipants: FirefliesParticipant[];
}> => {
  if (participants.length === 0) {
    return { matchedContacts: [], unmatchedParticipants: [] };
  }

  const emails = participants.map(({ email }) => email);
  const query = `
    query FindPeople($emails: [String!]!) {
      people(filter: { emails: { primaryEmail: { in: $emails } } }) {
        edges { node { id emails { primaryEmail } } }
      }
    }
  `;

  const variables = { emails } satisfies Record<string, unknown>;
  const response = await gqlRequest<FindPeopleResponse>(query, variables);
  const people = response.data?.people;
  if (!people?.edges) {
    return { matchedContacts: [], unmatchedParticipants: participants };
  }
  const matchedContacts = people.edges.map(({ node }) => ({
    id: node.id,
    email: node.emails?.primaryEmail || ''
  }));

  const matchedEmails = new Set(
    matchedContacts
      .map(({ email }) => email)
      .filter((email) => Boolean(email)),
  );
  const unmatchedParticipants = participants.filter(({ email }) => !matchedEmails.has(email));

  return { matchedContacts, unmatchedParticipants };
};

const createContactsForUnmatched = async (
  participants: FirefliesParticipant[],
): Promise<string[]> => {
  const newContactIds: string[] = [];

  for (const participant of participants) {
    const [firstName, ...lastNameParts] = participant.name.trim().split(/\s+/);
    const lastName = lastNameParts.join(' ');

    const mutation = `
      mutation CreatePerson($data: PersonCreateInput!) {
        createPerson(data: $data) { id }
      }
    `;

    const variables = {
      data: {
        name: { firstName, lastName },
        emails: { primaryEmail: participant.email },
      },
    } satisfies Record<string, unknown>;

    const response = await gqlRequest<CreatePersonResponse>(mutation, variables);
    if (!response.data?.createPerson?.id) {
      throw new Error(`Failed to create contact for ${participant.email}`);
    }
    newContactIds.push(response.data.createPerson.id);
  }

  return newContactIds;
};

const createNotesForParticipants = async (
  meetingData: FirefliesMeetingData,
  contactIds: string[],
): Promise<string[]> => {
  const noteIds: string[] = [];

  // Format date
  const meetingDate = new Date(meetingData.date);
  const formattedDate = meetingDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const durationMinutes = Math.round(meetingData.duration / 60);

  // Build summary-focused note body
  let noteBody = `# Meeting: ${meetingData.title}`;

  if (meetingData.summary.meeting_type) {
    noteBody += ` (${meetingData.summary.meeting_type})`;
  }

  noteBody += `\n\n**Date:** ${formattedDate}\n`;
  noteBody += `**Duration:** ${durationMinutes} minutes\n`;

  if (meetingData.participants.length > 0) {
    const participantNames = meetingData.participants.map(p => p.name).join(', ');
    noteBody += `**Participants:** ${participantNames}\n`;
  }

  // Overview section
  if (meetingData.summary.overview) {
    noteBody += `\n## Overview\n${meetingData.summary.overview}\n`;
  }

  // Key topics
  if (meetingData.summary.topics_discussed.length > 0) {
    noteBody += `\n## Key Topics\n`;
    meetingData.summary.topics_discussed.forEach(topic => {
      noteBody += `- ${topic}\n`;
    });
  }

  // Action items
  if (meetingData.summary.action_items.length > 0) {
    noteBody += `\n## Action Items\n`;
    meetingData.summary.action_items.forEach(item => {
      noteBody += `- ${item}\n`;
    });
  }

  // Insights section
  noteBody += `\n## Insights\n`;

  if (meetingData.summary.keywords.length > 0) {
    noteBody += `**Keywords:** ${meetingData.summary.keywords.join(', ')}\n`;
  }

  if (meetingData.analytics?.sentiments) {
    const sentiments = meetingData.analytics.sentiments;
    noteBody += `**Sentiment:** ${sentiments.positive_pct}% positive, ${sentiments.negative_pct}% negative, ${sentiments.neutral_pct}% neutral\n`;
  }

  if (meetingData.summary.meeting_type) {
    noteBody += `**Meeting Type:** ${meetingData.summary.meeting_type}\n`;
  }

  // Resources section
  noteBody += `\n## Resources\n`;
  noteBody += `[View Full Transcript](${meetingData.transcript_url})\n`;

  if (meetingData.recording_url) {
    noteBody += `[Watch Recording](${meetingData.recording_url})\n`;
  }

  const mutation = `
    mutation CreateNote($data: NoteCreateInput!) { createNote(data: $data) { id } }
  `;

  for (const contactId of contactIds) {
    const variables = {
      data: {
        title: `Meeting: ${meetingData.title}`,
        body: noteBody.trim(),
        person: { id: contactId },
      },
    } satisfies Record<string, unknown>;

    const response = await gqlRequest<CreateNoteResponse>(mutation, variables);
    if (!response.data?.createNote?.id) {
      throw new Error(`Failed to create note for contact ${contactId}`);
    }
    noteIds.push(response.data.createNote.id);
  }

  return noteIds;
};

const createMeetingRecord = async (
  meetingData: FirefliesMeetingData,
  _attendeeIds: string[],
): Promise<string> => {
  // Format date
  const meetingDate = new Date(meetingData.date);
  const formattedDate = meetingDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const durationMinutes = Math.round(meetingData.duration / 60);

  // Build summary-focused meeting notes (used when custom fields are enabled)
  let _meetingNotes = `**Date:** ${formattedDate}\n`;
  _meetingNotes += `**Duration:** ${durationMinutes} minutes\n`;

  if (meetingData.participants.length > 0) {
    const participantNames = meetingData.participants.map(p => p.name).join(', ');
    _meetingNotes += `**Participants:** ${participantNames}\n`;
  }

  // Overview section
  if (meetingData.summary.overview) {
    _meetingNotes += `\n## Overview\n${meetingData.summary.overview}\n`;
  }

  // Key topics
  if (meetingData.summary.topics_discussed.length > 0) {
    _meetingNotes += `\n## Key Topics\n`;
    meetingData.summary.topics_discussed.forEach(topic => {
      _meetingNotes += `- ${topic}\n`;
    });
  }

  // Action items
  if (meetingData.summary.action_items.length > 0) {
    _meetingNotes += `\n## Action Items\n`;
    meetingData.summary.action_items.forEach(item => {
      _meetingNotes += `- ${item}\n`;
    });
  }

  // Insights section
  _meetingNotes += `\n## Insights\n`;

  if (meetingData.summary.keywords.length > 0) {
    _meetingNotes += `**Keywords:** ${meetingData.summary.keywords.join(', ')}\n`;
  }

  if (meetingData.analytics?.sentiments) {
    const sentiments = meetingData.analytics.sentiments;
    _meetingNotes += `**Sentiment:** ${sentiments.positive_pct}% positive, ${sentiments.negative_pct}% negative, ${sentiments.neutral_pct}% neutral\n`;
  }

  if (meetingData.summary.meeting_type) {
    _meetingNotes += `**Meeting Type:** ${meetingData.summary.meeting_type}\n`;
  }

  // Resources section
  _meetingNotes += `\n## Resources\n`;
  _meetingNotes += `[View Full Transcript](${meetingData.transcript_url})\n`;

  if (meetingData.recording_url) {
    _meetingNotes += `[Watch Recording](${meetingData.recording_url})\n`;
  }

  const mutation = `
    mutation CreateMeeting($data: MeetingCreateInput!) { createMeeting(data: $data) { id } }
  `;

  // Custom fields enabled (after running: yarn setup:fields)
  const variables = {
    data: {
      name: meetingData.title,
      notes: _meetingNotes.trim(),
      meetingDate: meetingData.date,
      duration: durationMinutes,
      meetingType: meetingData.summary.meeting_type || null,
      keywords: meetingData.summary.keywords.join(', '),
      sentimentScore: meetingData.analytics?.sentiments
        ? meetingData.analytics.sentiments.positive_pct / 100
        : null,
      positivePercent: meetingData.analytics?.sentiments?.positive_pct || null,
      negativePercent: meetingData.analytics?.sentiments?.negative_pct || null,
      actionItemsCount: meetingData.summary.action_items.length,
      transcriptUrl: meetingData.transcript_url,
      recordingUrl: meetingData.recording_url || null,
      firefliesMeetingId: meetingData.id,
      organizerEmail: meetingData.organizer_email || null,
    },
  } satisfies Record<string, unknown>;

  const response = await gqlRequest<CreateMeetingResponse>(mutation, variables);
  if (!response.data?.createMeeting?.id) {
    throw new Error('Failed to create meeting: Invalid response from server');
  }
  return response.data.createMeeting.id;
};


