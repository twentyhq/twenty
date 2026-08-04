import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
import { DEFAULT_CALL_RECORDER_TRANSCRIPT_PROVIDER } from 'src/logic-functions/constants/default-call-recorder-transcript-provider';
import {
  RECALL_ASYNC_TRANSCRIPT_PROVIDERS,
  type RecallAsyncTranscriptProvider,
} from 'src/logic-functions/constants/recall-async-transcript-providers';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const isRecallAsyncTranscriptProvider = (
  value: unknown,
): value is RecallAsyncTranscriptProvider =>
  isNonEmptyString(value) &&
  Object.keys(RECALL_ASYNC_TRANSCRIPT_PROVIDERS).includes(value);

export const getRecallAsyncTranscriptProvider = () => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME,
  )?.trim();

  const providerId = isRecallAsyncTranscriptProvider(rawValue)
    ? rawValue
    : DEFAULT_CALL_RECORDER_TRANSCRIPT_PROVIDER;

  return { [providerId]: RECALL_ASYNC_TRANSCRIPT_PROVIDERS[providerId] };
};
