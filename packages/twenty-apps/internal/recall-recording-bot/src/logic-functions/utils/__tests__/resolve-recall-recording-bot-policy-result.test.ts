import { describe, expect, it } from 'vitest';

import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { resolveRecallRecordingBotPolicyResult } from 'src/logic-functions/utils/resolve-recall-recording-bot-policy-result.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const FUTURE_STARTS_AT = '2026-01-01T13:00:00.000Z';
const FUTURE_ENDS_AT = '2026-01-01T14:00:00.000Z';

describe('resolveRecallRecordingBotPolicyResult', () => {
  it('requires a bot when preference is ON and the event is upcoming', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          recallRecordingBotPreference: RecallRecordingBotPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasExternalParticipant: false,
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
          recallRecordingBotPreference: RecallRecordingBotPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: null,
          hasExternalParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'PREFERENCE_ON_MISSING_CONFERENCE_LINK',
    });
  });

  it('keeps AUTO limited to upcoming meetings with a conference link and an external participant', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          recallRecordingBotPreference: RecallRecordingBotPreference.AUTO,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasExternalParticipant: true,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: true,
      reason: 'AUTO_POLICY_MATCHED',
    });
  });

  it('does not request a bot for AUTO when the meeting has no external participant', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          recallRecordingBotPreference: RecallRecordingBotPreference.AUTO,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/internal-sync',
          hasExternalParticipant: false,
        },
        now: NOW,
        isRecallRecordingBotEnabledForWorkspace: true,
      }),
    ).toEqual({
      shouldRequestBot: false,
      reason: 'AUTO_NO_EXTERNAL_PARTICIPANT',
    });
  });

  it('cancels policy when the workspace bot is disabled', () => {
    expect(
      resolveRecallRecordingBotPolicyResult({
        input: {
          recallRecordingBotPreference: RecallRecordingBotPreference.ON,
          isCanceled: false,
          startsAt: FUTURE_STARTS_AT,
          endsAt: FUTURE_ENDS_AT,
          conferenceLinkUrl: 'https://meet.example.com/team-sync',
          hasExternalParticipant: true,
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
