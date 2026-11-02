import { EngineComponentKey } from '~/generated-metadata/graphql';

export const PRIMARY_ACTION_ENGINE_COMPONENT_KEYS = new Set<EngineComponentKey>(
  [
    EngineComponentKey.CREATE_NEW_RECORD,
    EngineComponentKey.COMPOSE_CAMPAIGN,
    EngineComponentKey.SEND_MESSAGE_CAMPAIGN,
    EngineComponentKey.SAVE_PAGE,
    EngineComponentKey.NEXT_PAGE_STEP,
    EngineComponentKey.ADD_CONNECTED_ACCOUNT,
    EngineComponentKey.FINISH_ACCOUNT_SETUP,
    EngineComponentKey.INSTALL_APPLICATION,
    EngineComponentKey.OPEN_APPLICATION_SETTINGS,
    EngineComponentKey.ADD_DATA_MODEL_OBJECT,
    EngineComponentKey.CREATE_DATA_MODEL_FIELD,
    EngineComponentKey.CREATE_AI_SKILL,
    EngineComponentKey.CREATE_AI_TOOL,
    EngineComponentKey.CREATE_BILLING_LIMIT,
    EngineComponentKey.GENERATE_DPA,
  ],
);
