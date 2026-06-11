import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileRecallRecordingBotWorkspaceMemberHandler } from 'src/logic-functions/reconcile-recall-recording-bot-workspace-member';

const findUpcomingCalendarEventIdsForWorkspaceMemberMock = vi.hoisted(() =>
  vi.fn(),
);
const reconcileRecallRecordingBotForCalendarEventIdsMock = vi.hoisted(() =>
  vi.fn(),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock(
  'src/logic-functions/data/find-upcoming-calendar-event-ids-for-workspace-member.util',
  () => ({
    findUpcomingCalendarEventIdsForWorkspaceMember:
      findUpcomingCalendarEventIdsForWorkspaceMemberMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/reconcile-recall-recording-bot.util',
  () => ({
    reconcileRecallRecordingBotForCalendarEventIds:
      reconcileRecallRecordingBotForCalendarEventIdsMock,
  }),
);

type WorkspaceMemberEvent = Parameters<
  typeof reconcileRecallRecordingBotWorkspaceMemberHandler
>[0];

const buildWorkspaceMemberEvent = ({
  action,
  updatedFields,
}: {
  action: string;
  updatedFields?: string[];
}): WorkspaceMemberEvent =>
  ({
    name: `workspaceMember.${action}`,
    recordId: 'workspace-member-1',
    properties: {
      updatedFields,
      before: { id: 'workspace-member-1' },
      after: { id: 'workspace-member-1' },
    },
  }) as unknown as WorkspaceMemberEvent;

describe('reconcileRecallRecordingBotWorkspaceMemberHandler', () => {
  beforeEach(() => {
    findUpcomingCalendarEventIdsForWorkspaceMemberMock.mockReset();
    findUpcomingCalendarEventIdsForWorkspaceMemberMock.mockResolvedValue([
      'calendar-event-1',
    ]);
    reconcileRecallRecordingBotForCalendarEventIdsMock.mockReset();
    reconcileRecallRecordingBotForCalendarEventIdsMock.mockResolvedValue([
      { action: 'CREATED' },
    ]);
  });

  it('reconciles upcoming meetings when the auto-record setting changes', async () => {
    const result = await reconcileRecallRecordingBotWorkspaceMemberHandler(
      buildWorkspaceMemberEvent({
        action: 'updated',
        updatedFields: ['meetingBotAutoRecordEnabled'],
      }),
    );

    expect(
      findUpcomingCalendarEventIdsForWorkspaceMemberMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceMemberId: 'workspace-member-1' }),
    );
    expect(
      reconcileRecallRecordingBotForCalendarEventIdsMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
    expect(result).toMatchObject({
      reconciled: true,
      workspaceMemberId: 'workspace-member-1',
    });
  });

  it('skips updates that do not touch the auto-record setting', async () => {
    const result = await reconcileRecallRecordingBotWorkspaceMemberHandler(
      buildWorkspaceMemberEvent({
        action: 'updated',
        updatedFields: ['name', 'timeZone'],
      }),
    );

    expect(
      findUpcomingCalendarEventIdsForWorkspaceMemberMock,
    ).not.toHaveBeenCalled();
    expect(
      reconcileRecallRecordingBotForCalendarEventIdsMock,
    ).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('skips created workspace members', async () => {
    const result = await reconcileRecallRecordingBotWorkspaceMemberHandler(
      buildWorkspaceMemberEvent({ action: 'created' }),
    );

    expect(
      reconcileRecallRecordingBotForCalendarEventIdsMock,
    ).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('reconciles upcoming meetings when a workspace member is deleted', async () => {
    const result = await reconcileRecallRecordingBotWorkspaceMemberHandler(
      buildWorkspaceMemberEvent({ action: 'deleted' }),
    );

    expect(
      reconcileRecallRecordingBotForCalendarEventIdsMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
    expect(result).toMatchObject({ reconciled: true });
  });

  it('skips reconciliation when the member has no upcoming meetings', async () => {
    findUpcomingCalendarEventIdsForWorkspaceMemberMock.mockResolvedValue([]);

    const result = await reconcileRecallRecordingBotWorkspaceMemberHandler(
      buildWorkspaceMemberEvent({
        action: 'updated',
        updatedFields: ['meetingBotAutoRecordEnabled'],
      }),
    );

    expect(
      reconcileRecallRecordingBotForCalendarEventIdsMock,
    ).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      skipped: true,
      reason: 'no upcoming calendar events',
    });
  });
});
