import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-prompt-env-var-name';
import { getCallRecorderSummaryPrompt } from 'src/logic-functions/utils/get-call-recorder-summary-prompt.util';

describe('getCallRecorderSummaryPrompt', () => {
  beforeEach(() => {
    delete process.env[CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME];
  });

  it('uses the default prompt when unset', () => {
    expect(getCallRecorderSummaryPrompt()).toBeUndefined();
  });

  it('returns the trimmed custom prompt', () => {
    process.env[CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME] =
      '  Write concise sales notes.  ';

    expect(getCallRecorderSummaryPrompt()).toBe('Write concise sales notes.');
  });

  it("is disabled only for 'false' (case- and space-insensitive)", () => {
    process.env[CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME] = '  False  ';

    expect(getCallRecorderSummaryPrompt()).toBe(false);
  });
});
