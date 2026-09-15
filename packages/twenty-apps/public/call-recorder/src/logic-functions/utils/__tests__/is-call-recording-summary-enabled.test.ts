import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-enabled-env-var-name';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';

describe('isCallRecordingSummaryEnabled', () => {
  beforeEach(() => {
    delete process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME];
  });

  it('defaults to enabled when unset', () => {
    expect(isCallRecordingSummaryEnabled()).toBe(true);
  });

  it.each(['false', '0', 'no', 'off', '  False  '])(
    'is disabled for %s',
    (value) => {
      process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME] = value;

      expect(isCallRecordingSummaryEnabled()).toBe(false);
    },
  );

  it.each(['true', '1', 'yes', 'on'])('is enabled for %s', (value) => {
    process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME] = value;

    expect(isCallRecordingSummaryEnabled()).toBe(true);
  });

  it('falls back to the default for unrecognized values', () => {
    process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME] = 'maybe';

    expect(isCallRecordingSummaryEnabled()).toBe(true);
  });
});
