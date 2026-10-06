import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatInboxViewKind {
  RECENT = 'RECENT',
  OPEN = 'OPEN',
  NEEDS_INPUT = 'NEEDS_INPUT',
  MENTIONS = 'MENTIONS',
  ASSIGNED = 'ASSIGNED',
  SNOOZED = 'SNOOZED',
  DONE = 'DONE',
  CHANNEL = 'CHANNEL',
}

registerEnumType(AgentChatInboxViewKind, {
  name: 'AgentChatInboxViewKind',
});
