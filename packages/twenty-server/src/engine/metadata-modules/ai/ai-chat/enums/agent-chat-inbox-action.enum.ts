import { registerEnumType } from '@nestjs/graphql';

import { type AgentChatInboxAction as SharedAgentChatInboxAction } from 'twenty-shared/ai';

export enum AgentChatInboxAction {
  READ = 'READ',
  UNREAD = 'UNREAD',
  ARCHIVE = 'ARCHIVE',
  SNOOZE = 'SNOOZE',
  MOVE_TO_INBOX = 'MOVE_TO_INBOX',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
}

registerEnumType(AgentChatInboxAction, { name: 'AgentChatInboxAction' });

// Fails to compile when an action is added on only one side
const _assertActionsMatchShared: Record<
  SharedAgentChatInboxAction,
  AgentChatInboxAction
> = AgentChatInboxAction;
