import { EngineComponentKey } from '~/generated-metadata/graphql';

export const ENGINE_COMPONENT_KEYS_WITH_SUB_MENU = new Set<EngineComponentKey>([
  EngineComponentKey.SEARCH_RECORDS,
  EngineComponentKey.SEARCH_RECORDS_FALLBACK,
  EngineComponentKey.ASK_AI,
  EngineComponentKey.VIEW_PREVIOUS_AI_CHATS,
]);
