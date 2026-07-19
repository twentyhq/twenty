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

  it('returns the markdown from a rich text value', () => {
    process.env[CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] =
      JSON.stringify({
        blocknote: '[{"type":"paragraph"}]',
        markdown: '  Write concise **sales** notes.  ',
      });

    expect(getCallRecorderAdditionalSummaryPrompt()).toBe(
      'Write concise **sales** notes.',
    );
  });

  it('returns undefined when the rich text markdown is empty', () => {
    process.env[CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] =
      JSON.stringify({ blocknote: null, markdown: null });

    expect(getCallRecorderAdditionalSummaryPrompt()).toBeUndefined();
  });

  it('falls back to raw plaintext stored before the variable became rich text', () => {
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
