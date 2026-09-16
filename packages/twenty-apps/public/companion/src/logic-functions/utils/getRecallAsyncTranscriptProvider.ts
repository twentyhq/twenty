import { COMPANION_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/COMPANION_TRANSCRIPT_PROVIDER_ENV_VAR_NAME';
import { DEFAULT_COMPANION_TRANSCRIPT_PROVIDER } from 'src/logic-functions/constants/DEFAULT_COMPANION_TRANSCRIPT_PROVIDER';
import { RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/RECALL_ASYNC_TRANSCRIPT_PROVIDERS';
import { type RecallAsyncTranscriptProvider } from 'src/logic-functions/types/RecallAsyncTranscriptProvider';
import { getApplicationVariableValue } from 'src/logic-functions/utils/getApplicationVariableValue';
import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';

const isRecallAsyncTranscriptProvider = (
  value: unknown,
): value is RecallAsyncTranscriptProvider =>
  isNonEmptyString(value) && value in RECALL_ASYNC_TRANSCRIPT_PROVIDERS;

export const getRecallAsyncTranscriptProvider = () => {
  const rawValue = getApplicationVariableValue(
    COMPANION_TRANSCRIPT_PROVIDER_ENV_VAR_NAME,
  )?.trim();

  const providerId = isRecallAsyncTranscriptProvider(rawValue)
    ? rawValue
    : DEFAULT_COMPANION_TRANSCRIPT_PROVIDER;

  return { [providerId]: RECALL_ASYNC_TRANSCRIPT_PROVIDERS[providerId] };
};
