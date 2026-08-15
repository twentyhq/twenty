import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-record-by-default-env-var-name';
import { isCallRecorderRecordByDefaultEnabled } from 'src/logic-functions/utils/is-call-recorder-record-by-default-enabled.util';

describe('isCallRecorderRecordByDefaultEnabled', () => {
  beforeEach(() => {
    delete process.env[CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME];
  });

  it('defaults to disabled when unset', () => {
    expect(isCallRecorderRecordByDefaultEnabled()).toBe(false);
  });

  it.each(['true', '1', 'yes', 'on', '  True  '])(
    'is enabled for %s',
    (value) => {
      process.env[CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME] = value;

      expect(isCallRecorderRecordByDefaultEnabled()).toBe(true);
    },
  );

  it.each(['false', '0', 'no', 'off'])('is disabled for %s', (value) => {
    process.env[CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME] = value;

    expect(isCallRecorderRecordByDefaultEnabled()).toBe(false);
  });

  it('falls back to the default for unrecognized values', () => {
    process.env[CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME] = 'maybe';

    expect(isCallRecorderRecordByDefaultEnabled()).toBe(false);
  });
});
