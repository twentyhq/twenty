import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-max-media-megabytes-env-var-name';
import { DEFAULT_CALL_RECORDER_MAX_MEDIA_MEGABYTES } from 'src/logic-functions/constants/default-call-recorder-max-media-megabytes';
import { getMaxMediaBytes } from 'src/logic-functions/domain/get-max-media-bytes.util';

const MEGABYTE = 1024 * 1024;
const DEFAULT_BYTES = DEFAULT_CALL_RECORDER_MAX_MEDIA_MEGABYTES * MEGABYTE;

describe('getMaxMediaBytes', () => {
  afterEach(() => {
    delete process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME];
  });

  it('returns the default in bytes when the variable is unset', () => {
    expect(getMaxMediaBytes()).toBe(DEFAULT_BYTES);
  });

  it('converts a configured megabyte value to bytes', () => {
    process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME] = '120';

    expect(getMaxMediaBytes()).toBe(120 * MEGABYTE);
  });

  it('falls back to the default for non-positive or unparseable values', () => {
    for (const invalidValue of ['0', '-5', 'abc', '', '  ']) {
      process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME] = invalidValue;

      expect(getMaxMediaBytes()).toBe(DEFAULT_BYTES);
    }
  });
});
