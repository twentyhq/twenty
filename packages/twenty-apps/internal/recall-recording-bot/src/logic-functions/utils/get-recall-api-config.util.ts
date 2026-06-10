import { DEFAULT_RECALL_BOT_NAME } from 'src/logic-functions/constants/default-recall-bot-name';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_BOT_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-bot-name-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';

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
    getApplicationVariableValue(RECALL_API_KEY_ENV_VAR_NAME),
  );

  if (apiKey === undefined) {
    return {
      success: false,
      error:
        'RECALL_API_KEY server variable is not set. A server admin must set it on the Recall Recording Bot application registration before scheduling bots.',
    };
  }

  const region =
    normalizeOptionalString(
      getApplicationVariableValue(RECALL_REGION_ENV_VAR_NAME),
    ) ?? DEFAULT_RECALL_REGION;
  const botName =
    normalizeOptionalString(
      getApplicationVariableValue(RECALL_BOT_NAME_ENV_VAR_NAME),
    ) ?? DEFAULT_RECALL_BOT_NAME;

  return {
    success: true,
    config: {
      apiKey,
      baseUrl: `https://${region}.recall.ai/api/v1`,
      botName,
    },
  };
};

const normalizeOptionalString = (
  value: string | undefined,
): string | undefined => {
  const trimmedValue = value?.trim();

  return trimmedValue === undefined || trimmedValue === ''
    ? undefined
    : trimmedValue;
};
