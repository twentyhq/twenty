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

export const getRecallApiConfig = async (): Promise<
  | {
      success: true;
      config: RecallApiConfig;
    }
  | {
      success: false;
      error: string;
    }
> => {
  const [apiKeyValue, regionValue, botNameValue] = await Promise.all([
    getApplicationVariableValue(RECALL_API_KEY_ENV_VAR_NAME),
    getApplicationVariableValue(RECALL_REGION_ENV_VAR_NAME),
    getApplicationVariableValue(RECALL_BOT_NAME_ENV_VAR_NAME),
  ]);
  const apiKey = normalizeOptionalString(apiKeyValue);

  if (apiKey === undefined) {
    return {
      success: false,
      error:
        'RECALL_API_KEY application variable is not set. Set it in the Recall Recording Bot app settings before scheduling bots.',
    };
  }

  const region = normalizeOptionalString(regionValue) ?? DEFAULT_RECALL_REGION;
  const botName =
    normalizeOptionalString(botNameValue) ?? DEFAULT_RECALL_BOT_NAME;

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
