import { BYTES_PER_MEGABYTE } from 'src/logic-functions/constants/bytes-per-megabyte';
import { CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-max-media-megabytes-env-var-name';
import { DEFAULT_CALL_RECORDER_MAX_MEDIA_MEGABYTES } from 'src/logic-functions/constants/default-call-recorder-max-media-megabytes';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Largest artifact (bytes) the ingestion path will download and upload. Above this
// the artifact is skipped instead of buffered, so a single oversized recording can
// no longer OOM-kill the 512MB executor Lambda.
export const getMaxMediaBytes = (): number => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME,
  );

  const megabytes = isNonEmptyString(rawValue)
    ? Number(rawValue.trim())
    : DEFAULT_CALL_RECORDER_MAX_MEDIA_MEGABYTES;

  const resolvedMegabytes =
    Number.isFinite(megabytes) && megabytes > 0
      ? megabytes
      : DEFAULT_CALL_RECORDER_MAX_MEDIA_MEGABYTES;

  return resolvedMegabytes * BYTES_PER_MEGABYTE;
};
