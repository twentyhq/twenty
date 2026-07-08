import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

// Stored as a RICH_TEXT variable ({ blocknote, markdown } JSON); the prompt only
// needs the markdown. Falls back to the raw value for plaintext stored before
// the variable became rich text.
const extractMarkdown = (rawValue: string): string | undefined => {
  try {
    const richTextValue = asRecord(JSON.parse(rawValue));

    if (richTextValue === undefined) {
      return getString(rawValue);
    }

    return getString(richTextValue.markdown);
  } catch {
    return getString(rawValue);
  }
};

export const getCallRecorderAdditionalSummaryPrompt = ():
  | string
  | undefined => {
  const rawValue = getString(
    getApplicationVariableValue(
      CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME,
    ),
  );

  if (rawValue === undefined) {
    return undefined;
  }

  return extractMarkdown(rawValue)?.trim();
};
