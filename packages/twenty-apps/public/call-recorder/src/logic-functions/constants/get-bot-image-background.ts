import { CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-bot-image-background-env-var-name';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Solid color drawn behind the centered logo. Falls back to the default when the
// configured value is missing or not a valid 3/6-digit hex color.
export const getBotImageBackground = (): string => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(rawValue)) {
    return DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND;
  }

  const normalizedValue = rawValue.trim();

  return HEX_COLOR_PATTERN.test(normalizedValue)
    ? normalizedValue
    : DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND;
};
