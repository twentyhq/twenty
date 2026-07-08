import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Stored as a RICH_TEXT variable ({ blocknote, markdown } JSON); the LLM prompt
// only needs the markdown rendering. Falls back to the raw value for plaintext
// stored before the variable became rich text.
const extractMarkdown = (rawValue: string): string => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return rawValue;
  }

  const record = asRecord(parsed);

  if (record === undefined) {
    return rawValue;
  }

  return isNonEmptyString(record.markdown) ? record.markdown : '';
};

export const getCallRecorderAdditionalSummaryPrompt = ():
  | string
  | undefined => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(rawValue)) {
    return undefined;
  }

  const additionalSummaryPrompt = extractMarkdown(rawValue).trim();

  return isNonEmptyString(additionalSummaryPrompt)
    ? additionalSummaryPrompt
    : undefined;
};
