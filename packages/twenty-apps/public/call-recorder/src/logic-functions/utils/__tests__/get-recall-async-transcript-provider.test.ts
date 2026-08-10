import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
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
});
