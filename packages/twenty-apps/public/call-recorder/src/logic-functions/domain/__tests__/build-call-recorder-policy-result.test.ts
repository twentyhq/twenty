import { afterEach, describe, expect, it } from 'vitest';

import { CallRecorderRecordMyMeetingsChoice } from 'src/constants/call-recorder-record-my-meetings-choice';
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
  participantWorkspaceMemberIds: [],
  hasExternalAttendee: false,
  ...overrides,
});

describe('buildCallRecorderPolicyResult', () => {
  afterEach(() => {
    delete process.env[
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME
    ];
  });

  it('requests a bot for the ON wire value', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        callRecorderPreference: 'ON',
      }),
      recordMyMeetingsChoices: new Map(),
      now: NOW,
    });

    expect(policyResult.callRecorderPreference).toBe('ON');
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot for the OFF wire value', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        callRecorderPreference: 'OFF',
      }),
      recordMyMeetingsChoices: new Map(),
      now: NOW,
    });

    expect(policyResult.callRecorderPreference).toBe('OFF');
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('PREFERENCE_OFF');
  });

  it('does not request a bot when the workspace turned calendar bot scheduling off', () => {
    process.env[CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME] =
      'false';

    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        callRecorderPreference: 'ON',
      }),
      recordMyMeetingsChoices: new Map(),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('CALENDAR_BOT_SCHEDULING_DISABLED');
  });

  it('does not request a bot when the attributed attendees all chose none', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
      }),
      recordMyMeetingsChoices: new Map([
        ['member-1', CallRecorderRecordMyMeetingsChoice.NONE],
        ['member-2', CallRecorderRecordMyMeetingsChoice.NONE],
      ]),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('ATTENDEES_OPTED_OUT');
  });

  it('requests a bot when at least one attributed attendee wants the meeting', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
      }),
      recordMyMeetingsChoices: new Map([
        ['member-1', CallRecorderRecordMyMeetingsChoice.NONE],
        ['member-2', CallRecorderRecordMyMeetingsChoice.ALL_MEETINGS],
      ]),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(true);
  });

  it('requests a bot when no attendee matches a workspace member', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        participantWorkspaceMemberIds: [],
        hasExternalAttendee: false,
      }),
      recordMyMeetingsChoices: new Map(),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(true);
  });
});
