import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, expect, it, vi } from 'vitest';

import { getRecordingParticipants } from 'src/logic-functions/flows/get-recording-participants.util';

const query = vi.fn();
const client = { query } as unknown as CoreApiClient;
const page = (nodes: object[], next?: string) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: Boolean(next), endCursor: next ?? null },
});
const viewer = {
  emails: ['tim@apple.com', 'calendar@apple.com'],
  name: 'Tim Apple',
  workspaceMemberId: 'self-member',
};
const recording = { id: 'recording-1', calendarEventId: 'event-1' };
const attendee = {
  calendarEventId: 'event-1',
  displayName: 'Alex',
  handle: 'ALEX@example.com',
};
beforeEach(() => vi.resetAllMocks());

it('uses CRM name and photo, excludes self, aliases and declined attendees, and deduplicates contacts', async () => {
  query
    .mockResolvedValueOnce({
      calendarEventParticipants: page([
        attendee,
        { ...attendee, handle: 'alex.alias@example.com' },
        { ...attendee, handle: 'TIM@APPLE.COM' },
        { ...attendee, handle: 'calendar@apple.com' },
        {
          ...attendee,
          handle: 'another-alias@apple.com',
          workspaceMemberId: 'self-member',
        },
        {
          ...attendee,
          handle: 'declined@example.com',
          responseStatus: 'DECLINED',
        },
      ]),
    })
    .mockResolvedValueOnce({
      people: page([
        {
          id: 'alex',
          name: { firstName: 'Alex', lastName: 'Martin' },
          avatarUrl: '/avatars/alex.png',
          emails: {
            primaryEmail: 'alex@example.com',
            additionalEmails: ['alex.alias@example.com'],
          },
        },
      ]),
    });
  const result = await getRecordingParticipants(client, [recording], viewer);
  expect(result.get(recording.id)).toEqual([
    { id: 'person:alex', name: 'Alex Martin', avatarUrl: '/avatars/alex.png' },
  ]);
});

it('paginates attendees and keeps each recording associated with its own people', async () => {
  const person = {
    id: 'alex',
    name: { firstName: 'Alex', lastName: 'Martin' },
  };
  query
    .mockResolvedValueOnce({
      calendarEventParticipants: page([{ ...attendee, person }], 'next'),
    })
    .mockResolvedValueOnce({
      calendarEventParticipants: page([
        {
          ...attendee,
          handle: 'sam@example.com',
          displayName: 'Sam Lee',
          person: { id: 'sam' },
        },
        {
          ...attendee,
          calendarEventId: 'event-2',
          person: { id: 'morgan', name: { firstName: 'Morgan' } },
        },
      ]),
    });
  const result = await getRecordingParticipants(
    client,
    [recording, { id: 'recording-2', calendarEventId: 'event-2' }],
    viewer,
  );
  expect(
    result.get(recording.id)?.map((participant) => participant.name),
  ).toEqual(['Alex Martin', 'Sam Lee']);
  expect(
    result.get('recording-2')?.map((participant) => participant.name),
  ).toEqual(['Morgan']);
  expect(query.mock.calls[1][0].calendarEventParticipants.__args.after).toBe(
    'next',
  );
});

it('uses detected speakers for unscheduled calls, removing self and repeated or anonymous speakers', async () => {
  const transcript = [
    'Tim Apple',
    'Alex Martin',
    'Alex Martin',
    'You',
    'Speaker 1',
    'Sam Lee',
    'Unknown speaker',
    'Host',
    'Guest',
  ].map((name) => ({ participant: { name }, words: [] }));
  const result = await getRecordingParticipants(
    client,
    [{ id: 'unscheduled', transcript }],
    viewer,
  );
  expect(result.get('unscheduled')).toEqual([
    { id: 'name:alex martin', name: 'Alex Martin', avatarUrl: null },
    { id: 'name:sam lee', name: 'Sam Lee', avatarUrl: null },
  ]);
  expect(query).not.toHaveBeenCalled();
});

it('returns no participant instead of substituting the signed-in user or guessing from the title', async () => {
  const result = await getRecordingParticipants(
    client,
    [{ id: 'empty', transcript: { status: 'PENDING' } }],
    viewer,
  );
  expect(result.get('empty')).toEqual([]);
});

it('does not attach a photo from a partial email match', async () => {
  query
    .mockResolvedValueOnce({ calendarEventParticipants: page([attendee]) })
    .mockResolvedValueOnce({
      people: page([
        {
          id: 'different',
          name: { firstName: 'Wrong person' },
          avatarUrl: '/wrong.png',
          emails: { primaryEmail: 'not-alex@example.com' },
        },
      ]),
    });
  const result = await getRecordingParticipants(client, [recording], viewer);
  expect(result.get(recording.id)).toEqual([
    { id: 'email:alex@example.com', name: 'Alex', avatarUrl: null },
  ]);
});

it('reuses a linked workspace member photo without a CRM contact', async () => {
  query.mockResolvedValueOnce({
    calendarEventParticipants: page([
      {
        ...attendee,
        handle: null,
        workspaceMember: {
          id: 'colleague',
          name: { firstName: 'Alex', lastName: 'Martin' },
          avatarUrl: '/colleague.png',
        },
      },
    ]),
  });
  const result = await getRecordingParticipants(client, [recording], viewer);
  expect(result.get(recording.id)).toEqual([
    {
      id: 'member:colleague',
      name: 'Alex Martin',
      avatarUrl: '/colleague.png',
    },
  ]);
});
