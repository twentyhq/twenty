import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';
import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
import { RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/recall-async-transcript-providers';
import { getRecallAsyncTranscriptProvider } from 'src/logic-functions/utils/get-recall-async-transcript-provider.util';

describe('getRecallAsyncTranscriptProvider', () => {
  beforeEach(() => {
    delete process.env[CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME];
  });

  it('defaults to Recall.ai transcription when unset', () => {
    expect(getRecallAsyncTranscriptProvider()).toEqual({
      recallai_async: { language_code: 'auto' },
    });
  });

  it('falls back to the default for an unsupported provider', () => {
    process.env[CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME] =
      'deepgram_async';

    expect(getRecallAsyncTranscriptProvider()).toEqual({
      recallai_async: { language_code: 'auto' },
    });
  });

  it('offers every supported provider as a select option', () => {
    const options =
      applicationConfig.config.applicationVariables?.[
        CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME
      ]?.options ?? [];

    expect(options.map((option) => option.value).sort()).toEqual(
      Object.keys(RECALL_ASYNC_TRANSCRIPT_PROVIDERS).sort(),
    );
  });
});
