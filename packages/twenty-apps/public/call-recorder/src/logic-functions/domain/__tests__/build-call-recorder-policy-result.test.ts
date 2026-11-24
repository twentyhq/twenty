import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { type CalendarEventParticipant } from 'src/logic-functions/types/calendar-event-participant.type';
import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

const NOW = new Date('2026-01-01T12:00:00.000Z');

const buildCalendarEventInput = (
  overrides: Partial<CallRecorderPolicyCalendarEventInput>,
): CallRecorderPolicyCalendarEventInput => ({
  id: 'calendar-event-1',
  isCanceled: false,
  startsAt: '2026-01-01T13:00:00.000Z',
  endsAt: '2026-01-01T14:00:00.000Z',
  iCalUid: 'ical-uid-1',
  conferenceLinkUrl: 'https://meet.google.com/customer-sync',
  callRecorderPreference: undefined,
  calendarChannelIds: ['calendar-channel-1'],
  participants: [],
  hasUnlistedParticipants: false,
  ...overrides,
});

const CALENDAR_CHANNEL_OWNER_BY_CALENDAR_CHANNEL_ID = new Map([
  [
    'calendar-channel-1',
    { userWorkspaceId: 'user-workspace-1', handle: 'ada@acme.com' },
  ],
]);

const buildPolicyResult = (
  overrides: Partial<CallRecorderPolicyCalendarEventInput>,
) =>
  buildCallRecorderPolicyResult({
    calendarEvent: buildCalendarEventInput(overrides),
    calendarChannelOwnerByCalendarChannelId:
      CALENDAR_CHANNEL_OWNER_BY_CALENDAR_CHANNEL_ID,
    memberRecordingPreferenceByUserWorkspaceId: new Map([
      ['user-workspace-1', 'ALL'],
    ]),
    now: NOW,
  });

const buildPolicyResultForMemberRecordingPreferences = (
  memberRecordingPreferenceByUserWorkspaceId: Map<
    string,
    MemberRecordingPreference
  >,
) =>
  buildCallRecorderPolicyResult({
    calendarEvent: buildCalendarEventInput({}),
    calendarChannelOwnerByCalendarChannelId:
      CALENDAR_CHANNEL_OWNER_BY_CALENDAR_CHANNEL_ID,
    memberRecordingPreferenceByUserWorkspaceId,
    now: NOW,
  });

const INTERNAL_PARTICIPANTS: CalendarEventParticipant[] = [
  { handle: 'ada@acme.com', isWorkspaceMember: true },
  { handle: 'linus@acme.com', isWorkspaceMember: false },
];

const EXTERNAL_PARTICIPANTS: CalendarEventParticipant[] = [
  { handle: 'ada@acme.com', isWorkspaceMember: true },
  { handle: 'buyer@customer.com', isWorkspaceMember: false },
];

const buildPolicyResultForParticipants = ({
  memberRecordingPreference,
  participants,
}: {
  memberRecordingPreference: MemberRecordingPreference;
  participants: CalendarEventParticipant[];
}) =>
  buildCallRecorderPolicyResult({
    calendarEvent: buildCalendarEventInput({ participants }),
    calendarChannelOwnerByCalendarChannelId:
      CALENDAR_CHANNEL_OWNER_BY_CALENDAR_CHANNEL_ID,
    memberRecordingPreferenceByUserWorkspaceId: new Map([
      ['user-workspace-1', memberRecordingPreference],
    ]),
    now: NOW,
  });

describe('buildCallRecorderPolicyResult', () => {
  afterEach(() => {
    delete process.env[
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME
    ];
  });

  it('requests a bot for the ON wire value', () => {
    const policyResult = buildPolicyResult({
      callRecorderPreference: 'ON',
    });

    expect(policyResult.callRecorderPreference).toBe('ON');
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot for the OFF wire value', () => {
    const policyResult = buildPolicyResult({
      callRecorderPreference: 'OFF',
    });

    expect(policyResult.callRecorderPreference).toBe('OFF');
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('PREFERENCE_OFF');
  });

  it('does not request a bot when the workspace turned calendar bot scheduling off', () => {
    process.env[CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME] =
      'false';

    const policyResult = buildPolicyResult({
      callRecorderPreference: 'ON',
    });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('CALENDAR_BOT_SCHEDULING_DISABLED');
  });

  it('requests a bot for a meeting on a member calendar', () => {
    const policyResult = buildPolicyResult({});

    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot when the member who has the meeting chose to record none', () => {
    const policyResult = buildPolicyResultForMemberRecordingPreferences(
      new Map([['user-workspace-1', 'NONE']]),
    );

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('OWNERS_OPTED_OUT');
  });

  it.each<[MemberRecordingPreference, string, CalendarEventParticipant[]]>([
    ['INTERNAL', 'an internal', INTERNAL_PARTICIPANTS],
    ['EXTERNAL', 'an external', EXTERNAL_PARTICIPANTS],
  ])(
    'requests a bot when the member chose %s and it is %s meeting',
    (memberRecordingPreference, _label, participants) => {
      const policyResult = buildPolicyResultForParticipants({
        memberRecordingPreference,
        participants,
      });

      expect(policyResult.shouldRequestBot).toBe(true);
      expect(policyResult.reason).toBe('RECORDING_ENABLED');
    },
  );

  it.each<[MemberRecordingPreference, string, CalendarEventParticipant[]]>([
    ['INTERNAL', 'an external', EXTERNAL_PARTICIPANTS],
    ['EXTERNAL', 'an internal', INTERNAL_PARTICIPANTS],
  ])(
    'does not request a bot when the member chose %s and it is %s meeting',
    (memberRecordingPreference, _label, participants) => {
      const policyResult = buildPolicyResultForParticipants({
        memberRecordingPreference,
        participants,
      });

      expect(policyResult.shouldRequestBot).toBe(false);
      expect(policyResult.reason).toBe('OWNERS_OPTED_OUT');
    },
  );

  it('judges the meeting against the address of each member calendar', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        calendarChannelIds: ['calendar-channel-1', 'calendar-channel-2'],
        participants: [
          { handle: 'grace@partner.com', isWorkspaceMember: true },
          { handle: 'ada@acme.com', isWorkspaceMember: true },
          { handle: 'bob@acme.com', isWorkspaceMember: false },
        ],
      }),
      calendarChannelOwnerByCalendarChannelId: new Map([
        [
          'calendar-channel-1',
          { userWorkspaceId: 'user-workspace-1', handle: 'grace@partner.com' },
        ],
        [
          'calendar-channel-2',
          { userWorkspaceId: 'user-workspace-2', handle: 'ada@acme.com' },
        ],
      ]),
      memberRecordingPreferenceByUserWorkspaceId: new Map([
        ['user-workspace-1', 'INTERNAL'],
        ['user-workspace-2', 'INTERNAL'],
      ]),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot when the choice of the member who has the meeting cannot be read', () => {
    const policyResult = buildPolicyResultForMemberRecordingPreferences(
      new Map(),
    );

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('OWNERS_OPTED_OUT');
  });

  it('does not request a bot for a meeting linked to no calendar channel', () => {
    const policyResult = buildPolicyResult({ calendarChannelIds: [] });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('NO_OWNER');
  });

  it('does not request a bot when the calendar channel of the meeting is gone', () => {
    const policyResult = buildPolicyResult({
      calendarChannelIds: ['deleted-calendar-channel'],
    });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('NO_OWNER');
  });
});
