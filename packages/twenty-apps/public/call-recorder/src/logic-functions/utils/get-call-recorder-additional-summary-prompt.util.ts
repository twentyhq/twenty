import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getCallRecorderAdditionalSummaryPrompt = ():
  | string
  | undefined => {
  const additionalSummaryPrompt = getApplicationVariableValue(
    CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME,
  )?.trim();

  return isNonEmptyString(additionalSummaryPrompt)
    ? additionalSummaryPrompt
    : undefined;
};
