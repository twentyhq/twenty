import { beforeEach, describe, expect, it, vi } from 'vitest';

import reconcileLogicFunction, {
  reconcileCallRecorderCalendarEventParticipantHandler,
} from 'src/logic-functions/reconcile-call-recorder-calendar-event-participant';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

const reconcileMock = vi.hoisted(() => vi.fn());
const fetchMemberRecordingPreferencesMock = vi.hoisted(() => vi.fn());
const fetchUpcomingCalendarEventsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: class {} }));

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds: reconcileMock,
}));

vi.mock(
  'src/logic-functions/data/fetch-member-recording-preference-by-user-workspace-id.util',
  () => ({
    fetchMemberRecordingPreferenceByUserWorkspaceId:
      fetchMemberRecordingPreferencesMock,
  }),
);

vi.mock('src/logic-functions/data/fetch-upcoming-calendar-events.util', () => ({
  fetchUpcomingCalendarEvents: fetchUpcomingCalendarEventsMock,
}));

const buildBatch = (calendarEventIds: string[]) => ({
  events: calendarEventIds.map((calendarEventId, index) => ({
    eventId: `database-event-${index}`,
    recordId: `participant-${index}`,
    properties: { after: { id: `participant-${index}`, calendarEventId } },
  })),
});

const setMemberRecordingPreferences = (
  memberRecordingPreferences: MemberRecordingPreference[],
) =>
  fetchMemberRecordingPreferencesMock.mockResolvedValue(
    new Map(
      memberRecordingPreferences.map((memberRecordingPreference, index) => [
        `user-workspace-${index}`,
        memberRecordingPreference,
      ]),
    ),
  );

const setUpcomingCalendarEventIds = (upcomingCalendarEventIds: string[]) =>
  fetchUpcomingCalendarEventsMock.mockImplementation(
    async ({
      candidateCalendarEventIds,
    }: {
      candidateCalendarEventIds: string[];
    }) =>
      upcomingCalendarEventIds
        .filter((id) => candidateCalendarEventIds.includes(id))
        .map((id) => ({ id, startsAt: undefined })),
  );

describe('reconcileCallRecorderCalendarEventParticipantHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reconcileMock.mockResolvedValue([]);
    setUpcomingCalendarEventIds(['calendar-event-1', 'calendar-event-2']);
  });

  it.each<[MemberRecordingPreference]>([['INTERNAL'], ['EXTERNAL']])(
    'reconciles each meeting of the batch once when a member chose %s',
    async (memberRecordingPreference) => {
      setMemberRecordingPreferences(['ALL', memberRecordingPreference]);

      const result = await reconcileCallRecorderCalendarEventParticipantHandler(
        buildBatch([
          'calendar-event-2',
          'calendar-event-1',
          'calendar-event-2',
        ]),
      );

      expect(reconcileMock).toHaveBeenCalledTimes(1);
      expect(reconcileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
        }),
      );
      expect(result).toMatchObject({ reconciled: true });
    },
  );

  it('does nothing when no member records by internal or external meetings', async () => {
    setMemberRecordingPreferences(['ALL', 'NONE']);

    const result = await reconcileCallRecorderCalendarEventParticipantHandler(
      buildBatch(['calendar-event-1']),
    );

    expect(reconcileMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('leaves out meetings that are not upcoming', async () => {
    setMemberRecordingPreferences(['INTERNAL']);
    setUpcomingCalendarEventIds(['calendar-event-2']);

    await reconcileCallRecorderCalendarEventParticipantHandler(
      buildBatch(['calendar-event-1', 'calendar-event-2']),
    );

    expect(reconcileMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-2'] }),
    );
  });

  it('does nothing when none of the meetings is upcoming', async () => {
    setMemberRecordingPreferences(['EXTERNAL']);
    setUpcomingCalendarEventIds([]);

    const result = await reconcileCallRecorderCalendarEventParticipantHandler(
      buildBatch(['calendar-event-1']),
    );

    expect(reconcileMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('does nothing when the batch names no calendar event', async () => {
    const result = await reconcileCallRecorderCalendarEventParticipantHandler(
      buildBatch([]),
    );

    expect(fetchMemberRecordingPreferencesMock).not.toHaveBeenCalled();
    expect(reconcileMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('listens to participants being added, removed, re-addressed or linked to a member', () => {
    expect(
      reconcileLogicFunction.config.databaseEventTriggerSettings,
    ).toMatchObject({
      eventName: 'calendarEventParticipant.*',
      updatedFields: ['handle', 'workspaceMemberId'],
      batchMode: true,
    });
  });
});
