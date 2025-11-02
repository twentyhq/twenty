/* eslint-disable no-console */
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

export type FirefliesWebhookPayload = {
  id: string; // Fireflies meeting ID
  title: string;
  start_time: string; // ISO 8601
  duration: number; // seconds
  transcript_url: string;
  recording_url?: string;
  summary?: string;
  transcript: string;
  participants: FirefliesParticipant[];
  organizer_email: string;
  webhook_secret?: string; // optional secret in body
};

export type ProcessResult = {
  success: boolean;
  meetingId?: string;
  noteIds?: string[];
  newContacts?: string[];
  errors?: string[];
  debug?: string[];
};

type GraphQLResponse<T> = { data: T };

type IdNode = { id: string };

type FindMeetingResponse = {
  meetings: { edges: Array<{ node: IdNode }> };
};

type FindPeopleResponse = {
  people: { edges: Array<{ node: { id: string; email: string } }> };
};

type CreatePersonResponse = { createPerson: { id: string } };
type CreateNoteResponse = { createNote: { id: string } };
type CreateMeetingResponse = { createMeeting: { id: string } };

const getApiUrl = (): string => {
  // Prefer SERVER_URL if present (running inside server container), fallback to localhost
  return process.env.SERVER_URL || 'http://localhost:3000';
};

const gqlRequest = async <T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> => {
  const url = `${getApiUrl()}/graphql`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY ?? ''}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }
  const json = (await res.json()) as GraphQLResponse<T> & { errors?: Array<{ message?: string }> };
  if (json && (json as any).errors && Array.isArray((json as any).errors) && (json as any).errors.length > 0) {
    const first = (json as any).errors[0];
    throw new Error(first?.message || 'GraphQL error');
  }
  return json as GraphQLResponse<T>;
};

export const main = async (
  params: FirefliesWebhookPayload | (Record<string, unknown> & Partial<FirefliesWebhookPayload>),
): Promise<ProcessResult> => {
  const payload = params as FirefliesWebhookPayload;

  const debug: string[] = [];
  const log = (message: string) => {
    debug.push(message);
    console.log(message);
  };

  const result: ProcessResult = {
    success: false,
    noteIds: [],
    newContacts: [],
    errors: [],
  };

  try {
    log('[fireflies] invoked');
    log(`[fireflies] apiUrl=${getApiUrl()}`);
    log(`[fireflies] payload id=${payload?.id ?? 'n/a'} title="${payload?.title ?? ''}" participants=${payload?.participants?.length ?? 0}`);

    if (!payload) {
      throw new Error('Missing webhook payload');
    }

    // Secret validation: body-provided secret only (headers are not forwarded to the function)
    const providedSecret = payload.webhook_secret;
    const expectedSecret = process.env.FIREFLIES_WEBHOOK_SECRET;
    if (!expectedSecret || providedSecret !== expectedSecret) {
      throw new Error('Invalid webhook secret');
    }
    log('[fireflies] secret validation: ok');

    // 1) Deduplicate by title (simplified approach)
    const existingMeeting = await findExistingMeeting(payload.title);
    if (existingMeeting) {
      log(`[fireflies] meeting already exists id=${existingMeeting.id}`);
      result.success = true;
      result.meetingId = existingMeeting.id;
      result.debug = debug;
      return result;
    }
    log('[fireflies] no existing meeting found, proceeding');

    // 2) Match participants to existing contacts
    const { matchedContacts, unmatchedParticipants } = await matchParticipantsToContacts(payload.participants);
    log(`[fireflies] matched=${matchedContacts.length} unmatched=${unmatchedParticipants.length}`);

    // 3) Optionally create contacts
    const autoCreate = toBoolean(process.env.AUTO_CREATE_CONTACTS, true);
    const newContactIds = autoCreate ? await createContactsForUnmatched(unmatchedParticipants) : [];
    result.newContacts = newContactIds;
    log(`[fireflies] autoCreate=${autoCreate} createdContacts=${newContactIds.length}`);

    // 4) Decide record type
    const isOneOnOne = payload.participants.length === 2;
    log(`[fireflies] isOneOnOne=${isOneOnOne}`);

    if (isOneOnOne) {
      const contactIds: string[] = [...matchedContacts.map((c) => c.id), ...newContactIds];
      result.noteIds = await createNotesForParticipants(payload, contactIds);
      log(`[fireflies] created notes count=${result.noteIds.length} ids=${result.noteIds.join(',')}`);
    } else {
      const attendeeIds: string[] = [...matchedContacts.map((c) => c.id), ...newContactIds];
      result.meetingId = await createMeetingRecord(payload, attendeeIds);
      log(`[fireflies] created meeting id=${result.meetingId}`);
    }

    result.success = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log(`[fireflies] error: ${message}`);
    result.errors?.push(message);
  }

  result.debug = debug;
  return result;
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
  const result = await gqlRequest<FindMeetingResponse>(query, variables);
  return result.data.meetings.edges[0]?.node;
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

  const emails = participants.map((p) => p.email);
  const query = `
    query FindPeople($emails: [String!]!) {
      people(filter: { emails: { primaryEmail: { in: $emails } } }) {
        edges { node { id emails { primaryEmail } } }
      }
    }
  `;

  const variables = { emails } satisfies Record<string, unknown>;
  const result = await gqlRequest<FindPeopleResponse>(query, variables);
  const matchedContacts = result.data.people.edges.map((e) => e.node);

  const matchedEmails = new Set(
    matchedContacts
      .map((c: any) => c.emails?.primaryEmail)
      .filter((e: string | undefined) => Boolean(e)),
  );
  const unmatchedParticipants = participants.filter((p) => !matchedEmails.has(p.email));

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

    const result = await gqlRequest<CreatePersonResponse>(mutation, variables);
    newContactIds.push(result.data.createPerson.id);
  }

  return newContactIds;
};

const createNotesForParticipants = async (
  payload: FirefliesWebhookPayload,
  contactIds: string[],
): Promise<string[]> => {
  const noteIds: string[] = [];

  const noteBody = `
# Meeting: ${payload.title}

**Date:** ${new Date(payload.start_time).toLocaleString()}
**Duration:** ${Math.round(payload.duration / 60)} minutes

## Summary
${payload.summary ?? 'No summary available'}

## Transcript
[View in Fireflies](${payload.transcript_url})

${payload.recording_url ? `[Watch Recording](${payload.recording_url})` : ''}
  `.trim();

  const mutation = `
    mutation CreateNote($data: NoteCreateInput!) { createNote(data: $data) { id } }
  `;

  for (const contactId of contactIds) {
    const variables = {
      data: {
        title: `Meeting: ${payload.title}`,
        body: noteBody,
        person: { id: contactId },
      },
    } satisfies Record<string, unknown>;

    const result = await gqlRequest<CreateNoteResponse>(mutation, variables);
    noteIds.push(result.data.createNote.id);
  }

  return noteIds;
};

const createMeetingRecord = async (
  payload: FirefliesWebhookPayload,
  attendeeIds: string[],
): Promise<string> => {
  const mutation = `
    mutation CreateMeeting($data: MeetingCreateInput!) { createMeeting(data: $data) { id } }
  `;

  const variables = {
    data: {
      name: payload.title,
    },
  } satisfies Record<string, unknown>;

  const result = await gqlRequest<CreateMeetingResponse>(mutation, variables);
  return result.data.createMeeting.id;
};


