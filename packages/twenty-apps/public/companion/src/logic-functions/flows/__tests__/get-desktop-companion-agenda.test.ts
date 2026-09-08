import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { getDesktopCompanionAgenda } from 'src/logic-functions/flows/get-desktop-companion-agenda.util';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = post;
  },
}));
vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: () => 'workspace-1',
}));
const query = vi.fn();
const client = { query } as unknown as CoreApiClient;
const page = (nodes: object[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-08T10:00:00Z'));
});
afterEach(() => vi.useRealTimers());

it('reads a personal agenda without another app schema and only returns recordings owned by the user', async () => {
  post.mockResolvedValue({
    data: {
      myCalendarChannels: [{ id: 'channel-1' }],
      currentWorkspace: { id: 'workspace-1', displayName: 'Apple' },
    },
  });
  const event = {
    startsAt: '2026-09-08T11:00:00Z',
    endsAt: '2026-09-08T12:00:00Z',
  };
  query
    .mockResolvedValueOnce({
      calendarEvents: page([
        { id: 'own-event', title: 'My meeting', ...event },
        { id: 'other-event', title: 'Another calendar', ...event },
      ]),
    })
    .mockResolvedValueOnce({
      calendarChannelEventAssociations: page([
        { calendarEventId: 'own-event' },
      ]),
    })
    .mockResolvedValueOnce({
      callRecordings: page([{ calendarEventId: 'own-event' }]),
    })
    .mockResolvedValueOnce({
      callRecordings: page([
        {
          id: 'own-recording',
          companionSession: { userWorkspaceId: 'user-1' },
        },
        {
          id: 'other-recording',
          companionSession: { userWorkspaceId: 'user-12' },
        },
      ]),
    });

  const agenda = await getDesktopCompanionAgenda(client, 'user-1');
  expect(agenda.meetings).toEqual([
    expect.objectContaining({ id: 'own-event', usesCalendarBot: true }),
  ]);
  expect(agenda.recordings).toEqual([
    { id: 'own-recording', participants: [] },
  ]);
  const queries = JSON.stringify(query.mock.calls);
  expect(queries).not.toMatch(/callRecorder|desktopRecordingSession/);
  expect(queries).toContain('companionSession');
});

it('keeps recordings available when no calendar is connected', async () => {
  post.mockResolvedValue({
    data: {
      myCalendarChannels: [],
      currentWorkspace: { id: 'workspace-1', displayName: 'Apple' },
    },
  });
  query.mockResolvedValue({ callRecordings: page([]) });
  expect(await getDesktopCompanionAgenda(client, 'user-1')).toMatchObject({
    calendarConnected: false,
    meetings: [],
    recordings: [],
  });
  expect(query).toHaveBeenCalledTimes(1);
});
