import { CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-prompt-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getCallRecorderSummaryPrompt = (): string | false | undefined => {
  const summaryPrompt = getApplicationVariableValue(
    CALL_RECORDER_SUMMARY_PROMPT_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(summaryPrompt)) {
    return undefined;
  }

  const trimmedSummaryPrompt = summaryPrompt.trim();

  return trimmedSummaryPrompt.toLowerCase() === 'false'
    ? false
    : trimmedSummaryPrompt;
};
