import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const getCallRecorderAdditionalSummaryPrompt = ():
  | string
  | undefined => {
  const rawValue = getString(
    getApplicationVariableValue(
      CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME,
    ),
  );

  if (isUndefined(rawValue)) {
    return undefined;
  }

  return extractRichTextMarkdown(rawValue)?.trim();
};
