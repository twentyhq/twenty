import { EngineComponentKey } from '~/generated-metadata/graphql';

// The inbox actions the server can apply to every chat of a tab
export const AI_CHAT_INBOX_TAB_SELECTION_ENGINE_COMPONENT_KEYS =
  new Set<EngineComponentKey>([
    EngineComponentKey.MARK_AI_CHAT_AS_READ,
    EngineComponentKey.MARK_AI_CHAT_AS_UNREAD,
    EngineComponentKey.MARK_AI_CHAT_AS_DONE,
    EngineComponentKey.REOPEN_AI_CHAT,
    EngineComponentKey.SNOOZE_AI_CHAT,
  ]);
