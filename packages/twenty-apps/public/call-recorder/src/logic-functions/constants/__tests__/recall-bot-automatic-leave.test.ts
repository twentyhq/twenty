import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getRecallBotAutomaticLeave } from 'src/logic-functions/constants/recall-bot-automatic-leave';

const ENV_KEYS = [
  'CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS',
  'CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS',
  'CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS',
] as const;
const AUTOMATIC_LEAVE_ARGUMENTS = {
  botDetectionActivateAfterSeconds: 300,
};

describe('getRecallBotAutomaticLeave', () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it('enables bot detection even when no timeout env vars are set', () => {
    const automaticLeave = getRecallBotAutomaticLeave(
      AUTOMATIC_LEAVE_ARGUMENTS,
    );

    expect(automaticLeave.everyone_left_timeout).toBeUndefined();
    expect(
      automaticLeave.bot_detection.using_participant_names.matches,
    ).toContain('notetaker');
  });

  it('includes the configured bot name in the name matches so co-scheduled bots recognize each other', () => {
    const automaticLeave = getRecallBotAutomaticLeave({
      ...AUTOMATIC_LEAVE_ARGUMENTS,
      botName: 'Twenty.com',
    });

    expect(
      automaticLeave.bot_detection.using_participant_names.matches,
    ).toContain('Twenty.com');
  });

  it('enables behavioral (participant events) detection', () => {
    const automaticLeave = getRecallBotAutomaticLeave(
      AUTOMATIC_LEAVE_ARGUMENTS,
    );

    expect(automaticLeave.bot_detection.using_participant_events).toBeDefined();
  });

  it('enables silence detection as the fallback when neither bot detector matches', () => {
    const automaticLeave = getRecallBotAutomaticLeave(
      AUTOMATIC_LEAVE_ARGUMENTS,
    );

    expect(automaticLeave.silence_detection).toEqual({
      activate_after: 1200,
      timeout: 300,
    });
  });

  it('still emits the existing everyone_left_timeout when its env var is set', () => {
    process.env.CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS = '2';

    const automaticLeave = getRecallBotAutomaticLeave(
      AUTOMATIC_LEAVE_ARGUMENTS,
    );

    expect(automaticLeave.everyone_left_timeout).toEqual({
      timeout: 2,
      activate_after: 1,
    });
  });
});
