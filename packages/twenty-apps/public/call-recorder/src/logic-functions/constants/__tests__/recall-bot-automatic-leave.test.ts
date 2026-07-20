import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getRecallBotAutomaticLeave } from 'src/logic-functions/constants/recall-bot-automatic-leave';

const ENV_KEYS = [
  'CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS',
  'CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS',
  'CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS',
  'CALL_RECORDER_BOT_DETECTION_ADDITIONAL_NAMES',
  'CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED',
] as const;

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

  it('always enables name-based bot detection even when no timeout env vars are set', () => {
    const automaticLeave = getRecallBotAutomaticLeave();

    expect(automaticLeave).toBeDefined();
    expect(automaticLeave?.everyone_left_timeout).toBeUndefined();
    expect(
      automaticLeave?.bot_detection?.using_participant_names?.matches,
    ).toContain('notetaker');
  });

  it('includes the configured bot name in the name matches so co-scheduled bots recognize each other', () => {
    const automaticLeave = getRecallBotAutomaticLeave({ botName: 'Twenty.com' });

    expect(
      automaticLeave?.bot_detection?.using_participant_names?.matches,
    ).toContain('Twenty.com');
  });

  it('appends comma-separated additional names from the instance variable', () => {
    process.env.CALL_RECORDER_BOT_DETECTION_ADDITIONAL_NAMES =
      ' Acme Bot , Zoom Recorder ';

    const matches =
      getRecallBotAutomaticLeave()?.bot_detection?.using_participant_names
        ?.matches ?? [];

    expect(matches).toContain('Acme Bot');
    expect(matches).toContain('Zoom Recorder');
  });

  it('does not duplicate a bot name already present in the default matches (case-insensitive)', () => {
    const matches =
      getRecallBotAutomaticLeave({ botName: 'NoteTaker' })?.bot_detection
        ?.using_participant_names?.matches ?? [];

    const noteTakerEntries = matches.filter(
      (match) => match.toLowerCase() === 'notetaker',
    );

    expect(noteTakerEntries).toHaveLength(1);
  });

  it('keeps behavioral (participant events) detection off by default', () => {
    const automaticLeave = getRecallBotAutomaticLeave();

    expect(
      automaticLeave?.bot_detection?.using_participant_events,
    ).toBeUndefined();
  });

  it('enables behavioral detection when the instance variable opts in', () => {
    process.env.CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED =
      'true';

    const automaticLeave = getRecallBotAutomaticLeave();

    expect(
      automaticLeave?.bot_detection?.using_participant_events,
    ).toBeDefined();
  });

  it('still emits the existing everyone_left_timeout when its env var is set', () => {
    process.env.CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS = '2';

    const automaticLeave = getRecallBotAutomaticLeave();

    expect(automaticLeave?.everyone_left_timeout).toEqual({
      timeout: 2,
      activate_after: 1,
    });
  });
});
