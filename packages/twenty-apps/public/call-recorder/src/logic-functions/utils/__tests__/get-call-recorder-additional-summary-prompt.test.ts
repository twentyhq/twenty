import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { getCallRecorderAdditionalSummaryPrompt } from 'src/logic-functions/utils/get-call-recorder-additional-summary-prompt.util';

describe('getCallRecorderAdditionalSummaryPrompt', () => {
  beforeEach(() => {
    delete process.env[CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME];
  });

  it('returns undefined when unset', () => {
    expect(getCallRecorderAdditionalSummaryPrompt()).toBeUndefined();
  });

  it('returns the trimmed additional prompt', () => {
    process.env[CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] =
      '  Write concise sales notes.  ';

    expect(getCallRecorderAdditionalSummaryPrompt()).toBe(
      'Write concise sales notes.',
    );
  });

  it('returns undefined for whitespace-only values', () => {
    process.env[CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] = '   ';

    expect(getCallRecorderAdditionalSummaryPrompt()).toBeUndefined();
  });
});
