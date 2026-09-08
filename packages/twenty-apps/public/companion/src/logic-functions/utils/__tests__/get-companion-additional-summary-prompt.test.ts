import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/companion-additional-summary-prompt-env-var-name';
import { getCompanionAdditionalSummaryPrompt } from 'src/logic-functions/utils/get-companion-additional-summary-prompt.util';

describe('getCompanionAdditionalSummaryPrompt', () => {
  beforeEach(() => {
    delete process.env[COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME];
  });

  it('returns undefined when unset', () => {
    expect(getCompanionAdditionalSummaryPrompt()).toBeUndefined();
  });

  it('returns the markdown from a rich text value', () => {
    process.env[COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] =
      JSON.stringify({
        blocknote: '[{"type":"paragraph"}]',
        markdown: '  Write concise **sales** notes.  ',
      });

    expect(getCompanionAdditionalSummaryPrompt()).toBe(
      'Write concise **sales** notes.',
    );
  });

  it('returns undefined when the rich text markdown is empty', () => {
    process.env[COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] =
      JSON.stringify({ blocknote: null, markdown: null });

    expect(getCompanionAdditionalSummaryPrompt()).toBeUndefined();
  });

  it('falls back to raw plaintext stored before the variable became rich text', () => {
    process.env[COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] =
      '  Write concise sales notes.  ';

    expect(getCompanionAdditionalSummaryPrompt()).toBe(
      'Write concise sales notes.',
    );
  });

  it('returns undefined for whitespace-only values', () => {
    process.env[COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME] = '   ';

    expect(getCompanionAdditionalSummaryPrompt()).toBeUndefined();
  });
});
