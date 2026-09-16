import { isUndefined } from '@sniptt/guards';
import { COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/COMPANION_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extractRichTextMarkdown';
import { getApplicationVariableValue } from 'src/logic-functions/utils/getApplicationVariableValue';
import { getString } from 'src/logic-functions/utils/getString';

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
