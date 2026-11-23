import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';

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
  ...overrides,
});

const OWNER_USER_WORKSPACE_ID_BY_CALENDAR_CHANNEL_ID = new Map([
  ['calendar-channel-1', 'user-workspace-1'],
]);

const buildPolicyResult = (
  overrides: Partial<CallRecorderPolicyCalendarEventInput>,
) =>
  buildCallRecorderPolicyResult({
    calendarEvent: buildCalendarEventInput(overrides),
    ownerUserWorkspaceIdByCalendarChannelId:
      OWNER_USER_WORKSPACE_ID_BY_CALENDAR_CHANNEL_ID,
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
