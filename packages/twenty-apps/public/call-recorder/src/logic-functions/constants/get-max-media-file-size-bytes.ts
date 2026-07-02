import { CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-max-media-file-size-mb-env-var-name';
import { DEFAULT_CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB } from 'src/logic-functions/constants/default-call-recorder-max-media-file-size-mb';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const getMaxMediaFileSizeBytes = (): number => {
  const configuredMaxMediaFileSizeMb = getApplicationVariableValue(
    CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME,
  );

  const maxMediaFileSizeMb = isNonEmptyString(configuredMaxMediaFileSizeMb)
    ? Number(configuredMaxMediaFileSizeMb.trim())
    : NaN;

  const resolvedMaxMediaFileSizeMb =
    Number.isFinite(maxMediaFileSizeMb) && maxMediaFileSizeMb > 0
      ? maxMediaFileSizeMb
      : DEFAULT_CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB;

  return resolvedMaxMediaFileSizeMb * BYTES_PER_MEGABYTE;
};
