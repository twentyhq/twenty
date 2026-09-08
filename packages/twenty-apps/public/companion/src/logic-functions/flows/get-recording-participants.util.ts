import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';

type Person = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  avatarUrl?: string | null;
  emails?: {
    primaryEmail?: string | null;
    additionalEmails?: string[] | null;
  } | null;
};

type CalendarParticipant = {
  calendarEventId: string;
  handle?: string | null;
  displayName?: string | null;
  responseStatus?: string | null;
  workspaceMemberId?: string | null;
  person?: Person | null;
  workspaceMember?: {
    id: string;
    name?: Person['name'];
    avatarUrl?: string | null;
  } | null;
};

type ParticipantCandidate = {
  name: string;
  email?: string;
  person?: Person | null;
  workspaceMember?: CalendarParticipant['workspaceMember'];
};

export type RecordingParticipant = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type RecordingWithParticipants = {
  id: string;
  calendarEventId?: string | null;
  transcript?: unknown;
};

export type RecordingViewer = {
  emails: string[];
  name: string;
  workspaceMemberId?: string;
};

const normalize = (value: string) => value.trim().toLowerCase();
const fullName = (name: Person['name']) =>
  [name?.firstName, name?.lastName].filter(Boolean).join(' ').trim();
const personEmails = (person: Person) =>
  [person.emails?.primaryEmail, ...(person.emails?.additionalEmails ?? [])]
    .filter(
      (email): email is string =>
        typeof email === 'string' && email.trim() !== '',
    )
    .map(normalize);

const transcriptParticipants = (
  transcript: unknown,
  viewer: RecordingViewer,
): ParticipantCandidate[] => {
  if (!Array.isArray(transcript)) return [];
  const selfEmails = new Set(viewer.emails.map(normalize));
  return transcript.flatMap((entry) => {
    const participant = asRecord(asRecord(entry)?.participant);
    const name =
      typeof participant?.name === 'string' ? participant.name.trim() : '';
    const email =
      typeof participant?.email === 'string'
        ? normalize(participant.email)
        : undefined;
    if (
      !name ||
      (email
        ? selfEmails.has(email)
        : normalize(name) === normalize(viewer.name)) ||
      /^(you|me|host|guest|unknown( speaker| participant)?|(speaker|participant|user)([\s_-]*\d+)?)$/i.test(name)
    )
      return [];
    return [{ name, email }];
  });
};

export const getRecordingParticipants = async (
  client: CoreApiClient,
  recordings: RecordingWithParticipants[],
  viewer: RecordingViewer,
): Promise<Map<string, RecordingParticipant[]>> => {
  const eventIds = [
    ...new Set(
      recordings.flatMap((recording) =>
        recording.calendarEventId ? [recording.calendarEventId] : [],
      ),
    ),
  ];
  const calendarParticipants = eventIds.length
    ? await fetchAllNodes<CalendarParticipant>(async (after) => {
        const result = await client.query({
          calendarEventParticipants: {
            __args: {
              first: 200,
              ...(after ? { after } : {}),
              filter: { calendarEventId: { in: eventIds } },
            },
            edges: {
              node: {
                calendarEventId: true,
                handle: true,
                displayName: true,
                responseStatus: true,
                workspaceMemberId: true,
                person: {
                  id: true,
                  name: { firstName: true, lastName: true },
                  avatarUrl: true,
                  emails: { primaryEmail: true, additionalEmails: true },
                },
                workspaceMember: {
                  id: true,
                  name: { firstName: true, lastName: true },
                  avatarUrl: true,
                },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        });
        return result.calendarEventParticipants as
          | ConnectionPage<CalendarParticipant>
          | undefined;
      })
    : [];
  const selfEmails = new Set(viewer.emails.map(normalize));
  const candidatesByRecording = new Map<string, ParticipantCandidate[]>();
  for (const recording of recordings) {
    const attendees = calendarParticipants
      .filter(
        (participant) =>
          participant.calendarEventId === recording.calendarEventId &&
          participant.responseStatus !== 'DECLINED' &&
          !(
            viewer.workspaceMemberId &&
            participant.workspaceMemberId === viewer.workspaceMemberId
          ) &&
          !selfEmails.has(normalize(participant.handle ?? '')) &&
          !(
            participant.person &&
            personEmails(participant.person).some((email) =>
              selfEmails.has(email),
            )
          ),
      )
      .map((participant) => ({
        name:
          participant.displayName?.trim() || participant.handle?.trim() || '',
        email: participant.handle ? normalize(participant.handle) : undefined,
        person: participant.person,
        workspaceMember: participant.workspaceMember,
      }));
    candidatesByRecording.set(
      recording.id,
      attendees.length
        ? attendees
        : transcriptParticipants(recording.transcript, viewer),
    );
  }

  const emails = [
    ...new Set(
      [...candidatesByRecording.values()]
        .flat()
        .flatMap((participant) =>
          !participant.person && participant.email ? [participant.email] : [],
        ),
    ),
  ];
  const people = emails.length
    ? await fetchAllNodes<Person>(async (after) => {
        const result = await client.query({
          people: {
            __args: {
              first: 200,
              ...(after ? { after } : {}),
              filter: {
                or: emails.flatMap((email) => [
                  { emails: { primaryEmail: { ilike: email } } },
                  { emails: { additionalEmails: { like: `%${email}%` } } },
                ]),
              },
            },
            edges: {
              node: {
                id: true,
                name: { firstName: true, lastName: true },
                avatarUrl: true,
                emails: { primaryEmail: true, additionalEmails: true },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        });
        return result.people as ConnectionPage<Person> | undefined;
      })
    : [];
  const participantsByRecording = new Map<string, RecordingParticipant[]>();
  for (const [recordingId, candidates] of candidatesByRecording) {
    const participants = new Map<string, RecordingParticipant>();
    for (const candidate of candidates) {
      // JSON email filters are broad; only an exact email match can identify a person.
      const person =
        candidate.person ??
        people.find(
          (person) =>
            candidate.email && personEmails(person).includes(candidate.email),
        );
      if (person && personEmails(person).some((email) => selfEmails.has(email)))
        continue;
      const name =
        fullName(person?.name) ||
        fullName(candidate.workspaceMember?.name) ||
        candidate.name;
      if (!name) continue;
      const id = person
        ? `person:${person.id}`
        : candidate.workspaceMember
          ? `member:${candidate.workspaceMember.id}`
          : candidate.email
            ? `email:${candidate.email}`
            : `name:${normalize(name)}`;
      participants.set(id, {
        id,
        name,
        avatarUrl:
          person?.avatarUrl || candidate.workspaceMember?.avatarUrl || null,
      });
    }
    participantsByRecording.set(
      recordingId,
      [...participants.values()].sort((first, second) =>
        first.id.localeCompare(second.id),
      ),
    );
  }
  return participantsByRecording;
};
