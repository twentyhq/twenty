import { COMPANION_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/companion-transcript-provider-env-var-name';
import { DEFAULT_COMPANION_TRANSCRIPT_PROVIDER } from 'src/logic-functions/constants/default-companion-transcript-provider';
import { RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/recall-async-transcript-providers';
import { type RecallAsyncTranscriptProvider } from 'src/logic-functions/types/recall-async-transcript-provider.type';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from '@twentyhq/recall-utils/utils/is-non-empty-string.util';

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
