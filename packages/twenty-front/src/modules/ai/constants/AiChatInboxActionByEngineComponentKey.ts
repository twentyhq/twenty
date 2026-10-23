import {
  AgentChatInboxAction,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const AI_CHAT_INBOX_ACTION_BY_ENGINE_COMPONENT_KEY: Partial<
  Record<EngineComponentKey, AgentChatInboxAction>
> = {
  [EngineComponentKey.MARK_AI_CHAT_AS_READ]: AgentChatInboxAction.READ,
  [EngineComponentKey.MARK_AI_CHAT_AS_UNREAD]: AgentChatInboxAction.UNREAD,
  [EngineComponentKey.MARK_AI_CHAT_AS_DONE]: AgentChatInboxAction.ARCHIVE,
  [EngineComponentKey.REOPEN_AI_CHAT]: AgentChatInboxAction.MOVE_TO_INBOX,
  [EngineComponentKey.SNOOZE_AI_CHAT]: AgentChatInboxAction.SNOOZE,
  [EngineComponentKey.SUBSCRIBE_TO_AI_CHAT]: AgentChatInboxAction.SUBSCRIBE,
  [EngineComponentKey.UNSUBSCRIBE_FROM_AI_CHAT]:
    AgentChatInboxAction.UNSUBSCRIBE,
};
