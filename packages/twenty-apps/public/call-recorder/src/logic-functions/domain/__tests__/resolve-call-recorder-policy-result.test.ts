import { describe, expect, it } from 'vitest';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { resolveCallRecorderPolicyResult } from 'src/logic-functions/domain/resolve-call-recorder-policy-result.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const FUTURE_STARTS_AT = '2026-01-01T13:00:00.000Z';
const FUTURE_ENDS_AT = '2026-01-01T14:00:00.000Z';
const PAST_STARTS_AT = '2026-01-01T09:00:00.000Z';
const PAST_ENDS_AT = '2026-01-01T10:00:00.000Z';

describe('resolveCallRecorderPolicyResult', () => {
  it('requires a bot when preference is ON and the event is upcoming', () => {
    expect(
      resolveCallRecorderPolicyResult({
        input: {
          callRecorderPreference: CallRecorderPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
        },
        now: NOW,
      }),
    ).toEqual({
      shouldRequestBot: true,
      reason: 'RECORDING_ENABLED',
    });
  });

  it('does not request a bot for ON when the meeting has no conference link', () => {
    expect(
      resolveCallRecorderPolicyResult({
        input: {
          callRecorderPreference: CallRecorderPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: undefined,
        },
        now: NOW,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'MISSING_CONFERENCE_LINK',
    });
  });

  it('requires a bot without an event preference override', () => {
    expect(
      resolveCallRecorderPolicyResult({
        input: {
          callRecorderPreference: undefined,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
        },
        now: NOW,
      }),
    ).toEqual({
      shouldRequestBot: true,
      reason: 'RECORDING_ENABLED',
    });
  });

  it('lets an OFF event preference opt out of workspace auto-recording', () => {
    expect(
      resolveCallRecorderPolicyResult({
        input: {
          callRecorderPreference: CallRecorderPreference.OFF,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
        },
        now: NOW,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'PREFERENCE_OFF',
    });
  });

  it('does not request a bot for a meeting that already ended', () => {
    expect(
      resolveCallRecorderPolicyResult({
        input: {
          callRecorderPreference: undefined,
          isCanceled: false,
          startsAt: PAST_STARTS_AT,
          endsAt: PAST_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
        },
        now: NOW,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'EVENT_NOT_UPCOMING',
    });
  });

  it('does not request a bot for a canceled meeting', () => {
    expect(
      resolveCallRecorderPolicyResult({
        input: {
          callRecorderPreference: undefined,
          isCanceled: true,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
        },
        now: NOW,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'EVENT_CANCELED',
    });
  });
});
