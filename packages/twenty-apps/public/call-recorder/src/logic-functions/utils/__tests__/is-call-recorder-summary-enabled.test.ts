import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-enabled-env-var-name';
import { isCallRecorderSummaryEnabled } from 'src/logic-functions/utils/is-call-recorder-summary-enabled.util';

describe('isCallRecorderSummaryEnabled', () => {
  afterEach(() => {
    delete process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME];
  });

  it('is enabled by default when unset', () => {
    expect(isCallRecorderSummaryEnabled()).toBe(true);
  });

  it("is enabled for 'true'", () => {
    process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME] = 'true';
    expect(isCallRecorderSummaryEnabled()).toBe(true);
  });

  it("is disabled only for 'false' (case- and space-insensitive)", () => {
    process.env[CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME] = '  False  ';
    expect(isCallRecorderSummaryEnabled()).toBe(false);
  });
});
