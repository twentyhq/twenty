import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';
import { CALL_RECORDER_MAPPED_VARIABLE_KEYS } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
import { RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/recall-async-transcript-providers';

describe('application config', () => {
  it('lays out every application variable in the settings component', () => {
    expect([...CALL_RECORDER_MAPPED_VARIABLE_KEYS].sort()).toEqual(
      Object.keys(applicationConfig.config.applicationVariables ?? {}).sort(),
    );
  });

  it('offers every supported transcript provider as a select option', () => {
    const options =
      applicationConfig.config.applicationVariables?.[
        CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME
      ]?.options ?? [];

    expect(options.map((option) => option.value).sort()).toEqual(
      Object.keys(RECALL_ASYNC_TRANSCRIPT_PROVIDERS).sort(),
    );
  });
});
