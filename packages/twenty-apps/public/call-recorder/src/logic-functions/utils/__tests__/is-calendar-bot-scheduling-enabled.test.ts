import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';

describe('isCalendarBotSchedulingEnabled', () => {
  beforeEach(() => {
    delete process.env[
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME
    ];
  });

  afterEach(() => {
    delete process.env[
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME
    ];
  });

  it('defaults to enabled when unset', () => {
    expect(isCalendarBotSchedulingEnabled()).toBe(true);
  });

  it.each(['false', '0', 'no', 'off'])('is disabled for %s', (value) => {
    process.env[CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME] =
      value;

    expect(isCalendarBotSchedulingEnabled()).toBe(false);
  });

  it.each(['true', '1', 'yes', 'on'])('is enabled for %s', (value) => {
    process.env[CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME] =
      value;

    expect(isCalendarBotSchedulingEnabled()).toBe(true);
  });

  it('falls back to the default for unrecognized values', () => {
    process.env[CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME] =
      'maybe';

    expect(isCalendarBotSchedulingEnabled()).toBe(true);
  });
});
