import { describe, expect, it } from 'vitest';

import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { resolveRecallRecordingBotPolicyResult } from 'src/logic-functions/domain/resolve-recall-recording-bot-policy-result.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const FUTURE_STARTS_AT = '2026-01-01T13:00:00.000Z';
const FUTURE_ENDS_AT = '2026-01-01T14:00:00.000Z';
const PAST_STARTS_AT = '2026-01-01T09:00:00.000Z';
const PAST_ENDS_AT = '2026-01-01T10:00:00.000Z';

describe('resolveRecallRecordingBotPolicyResult', () => {
  it('requires a bot when preference is ON and the event is upcoming', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: RecallRecordingBotPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: false,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: true,
      reason: 'PREFERENCE_ON',
    });
  });

  it('does not request a bot for ON when the meeting has no conference link', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: RecallRecordingBotPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: undefined,
          hasAutoRecordParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'MISSING_CONFERENCE_LINK',
    });
  });

  it('requires a bot without an override when a participating member has auto-record enabled', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: undefined,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: true,
      reason: 'MEMBER_AUTO_RECORD',
    });
  });

  it('does not request a bot without an override when no participating member has auto-record enabled', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: undefined,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: false,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'NO_MEMBER_AUTO_RECORD',
    });
  });

  it('lets an OFF override win over a member auto-record setting', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: RecallRecordingBotPreference.OFF,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'PREFERENCE_OFF',
    });
  });

  it('does not request a bot for a meeting that already ended', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: undefined,
          isCanceled: false,
          startsAt: PAST_STARTS_AT,
          endsAt: PAST_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'EVENT_NOT_UPCOMING',
    });
  });

  it('does not request a bot for a canceled meeting even with auto-record participants', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: undefined,
          isCanceled: true,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'EVENT_CANCELED',
    });
  });

  it('cancels policy when the workspace bot is disabled', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          meetingBotPreference: RecallRecordingBotPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasAutoRecordParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: false,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'WORKSPACE_BOT_DISABLED',
    });
  });
});
