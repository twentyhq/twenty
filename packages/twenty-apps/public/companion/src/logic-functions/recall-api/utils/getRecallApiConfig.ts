import { isUndefined } from '@sniptt/guards';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/DEFAULT_RECALL_REGION';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/RECALL_API_KEY_ENV_VAR_NAME';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/RECALL_REGION_ENV_VAR_NAME';
import { getApplicationVariableValue } from 'src/logic-functions/utils/getApplicationVariableValue';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalizeOptionalString';
import { type RecallApiConfig } from 'src/logic-functions/types/RecallApiConfig';

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
        'RECALL_API_KEY server variable is not set. A server admin must set it on the Desktop Recorder application registration before recording desktop calls.',
    };
  }

  const region =
    normalizeOptionalString(
      getApplicationVariableValue(RECALL_REGION_ENV_VAR_NAME)?.trim(),
    ) ?? DEFAULT_RECALL_REGION;

  if (!/^[a-z]+-[a-z]+-\d+$/.test(region)) {
    return {
      success: false,
      error: 'RECALL_REGION must be a Recall region slug.',
    };
  }

  return {
    success: true,
    config: {
      apiKey,
      baseUrl: `https://${region}.recall.ai/api/v1`,
    },
  };
};
