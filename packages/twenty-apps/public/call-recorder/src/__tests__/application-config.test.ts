import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';
import { CALL_RECORDER_MAPPED_VARIABLE_KEYS } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { CALL_RECORDER_STYLE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-style-env-var-name';
import { CALL_RECORDER_STYLES } from 'src/logic-functions/constants/call-recorder-styles';
import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
import { RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/recall-async-transcript-providers';

describe('application config', () => {
  it('passes the SDK manifest validation', () => {
    expect(applicationConfig.errors).toEqual([]);
  });

  it('lays out every non-deprecated application variable in the settings component', () => {
    const activeVariableKeys = Object.entries(
      applicationConfig.config.applicationVariables ?? {},
    )
      .filter(([, variable]) => variable.isDeprecated !== true)
      .map(([key]) => key);

    expect([...CALL_RECORDER_MAPPED_VARIABLE_KEYS].sort()).toEqual(
      activeVariableKeys.sort(),
    );
  });

  it('offers every recorder style as a select option', () => {
    const options =
      applicationConfig.config.applicationVariables?.[
        CALL_RECORDER_STYLE_ENV_VAR_NAME
      ]?.options ?? [];

    expect(options.map((option) => option.value).sort()).toEqual(
      [...CALL_RECORDER_STYLES].sort(),
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
