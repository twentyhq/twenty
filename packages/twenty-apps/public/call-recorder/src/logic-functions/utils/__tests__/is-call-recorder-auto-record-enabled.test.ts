import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_AUTO_RECORD_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-auto-record-enabled-env-var-name';
import { isCallRecorderAutoRecordEnabled } from 'src/logic-functions/utils/is-call-recorder-auto-record-enabled.util';

describe('isCallRecorderAutoRecordEnabled', () => {
  beforeEach(() => {
    delete process.env[CALL_RECORDER_AUTO_RECORD_ENABLED_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[CALL_RECORDER_AUTO_RECORD_ENABLED_ENV_VAR_NAME];
  });

  it('defaults to disabled when unset', () => {
    expect(isCallRecorderAutoRecordEnabled()).toBe(false);
  });

  it.each(['true', '1', 'yes', 'on', '  True  '])(
    'is enabled for %s',
    (value) => {
      process.env[CALL_RECORDER_AUTO_RECORD_ENABLED_ENV_VAR_NAME] = value;

      expect(isCallRecorderAutoRecordEnabled()).toBe(true);
    },
  );

  it.each(['false', '0', 'no', 'off'])('is disabled for %s', (value) => {
    process.env[CALL_RECORDER_AUTO_RECORD_ENABLED_ENV_VAR_NAME] = value;

    expect(isCallRecorderAutoRecordEnabled()).toBe(false);
  });

  it('falls back to the default for unrecognized values', () => {
    process.env[CALL_RECORDER_AUTO_RECORD_ENABLED_ENV_VAR_NAME] = 'maybe';

    expect(isCallRecorderAutoRecordEnabled()).toBe(false);
  });
});
