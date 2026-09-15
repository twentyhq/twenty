import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { DEFAULT_CALL_RECORDER_NAME } from 'src/logic-functions/constants/default-call-recorder-name';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export type RecallApiConfig = {
  apiKey: string;
  baseUrl: string;
  botName: string;
};

export const getRecallApiConfig = ():
  | {
      success: true;
      config: RecallApiConfig;
    }
  | {
      success: false;
      error: string;
    } => {
  const apiKey = normalizeOptionalString(
    getApplicationVariableValue(RECALL_API_KEY_ENV_VAR_NAME)?.trim(),
  );

  if (isUndefined(apiKey)) {
    return {
      success: false,
      error:
        'RECALL_API_KEY server variable is not set. A server admin must set it on the Call Recorder application registration before scheduling bots.',
    };
  }

  const region =
    normalizeOptionalString(
      getApplicationVariableValue(RECALL_REGION_ENV_VAR_NAME)?.trim(),
    ) ?? DEFAULT_RECALL_REGION;
  const botName =
    normalizeOptionalString(
      getApplicationVariableValue(CALL_RECORDER_NAME_ENV_VAR_NAME)?.trim(),
    ) ?? DEFAULT_CALL_RECORDER_NAME;

  return {
    success: true,
    config: {
      apiKey,
      baseUrl: `https://${region}.recall.ai/api/v1`,
      botName,
    },
  };
};
