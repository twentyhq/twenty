import { isUndefined } from '@sniptt/guards';

import { COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/companion-additional-summary-prompt-env-var-name';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getString } from '@twentyhq/recall-utils/utils/get-string.util';

export const getCompanionAdditionalSummaryPrompt = (): string | undefined => {
  const rawValue = getString(
    getApplicationVariableValue(
      COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME,
    ),
  );

  if (isUndefined(rawValue)) {
    return undefined;
  }

  return extractRichTextMarkdown(rawValue)?.trim();
};
