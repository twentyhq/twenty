import { EngineComponentKey } from '~/generated-metadata/graphql';

export const AI_CHAT_INBOX_TRIAGE_ENGINE_COMPONENT_KEYS =
  new Set<EngineComponentKey>([
    EngineComponentKey.SNOOZE_AI_CHAT,
    EngineComponentKey.MARK_AI_CHAT_AS_DONE,
    EngineComponentKey.REOPEN_AI_CHAT,
  ]);
