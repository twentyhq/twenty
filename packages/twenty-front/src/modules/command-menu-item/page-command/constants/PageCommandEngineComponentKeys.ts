import { EngineComponentKey } from '~/generated-metadata/graphql';

export const PAGE_COMMAND_ENGINE_COMPONENT_KEYS = new Set<EngineComponentKey>([
  EngineComponentKey.SAVE_PAGE,
  EngineComponentKey.CANCEL_PAGE,
  EngineComponentKey.NEXT_PAGE_STEP,
  EngineComponentKey.ADD_CONNECTED_ACCOUNT,
  EngineComponentKey.FINISH_ACCOUNT_SETUP,
  EngineComponentKey.INSTALL_APPLICATION,
  EngineComponentKey.OPEN_APPLICATION_SETTINGS,
  EngineComponentKey.ADD_DATA_MODEL_OBJECT,
  EngineComponentKey.CREATE_DATA_MODEL_FIELD,
  EngineComponentKey.SEE_OBJECT_RECORDS,
  EngineComponentKey.CREATE_AI_SKILL,
  EngineComponentKey.CREATE_AI_TOOL,
  EngineComponentKey.CREATE_BILLING_LIMIT,
  EngineComponentKey.GENERATE_DPA,
  EngineComponentKey.DELETE_PAGE_ITEM,
]);
