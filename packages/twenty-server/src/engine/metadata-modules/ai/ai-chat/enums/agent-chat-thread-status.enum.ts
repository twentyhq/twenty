import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatThreadStatus {
  OPEN = 'open',
  SNOOZED = 'snoozed',
  DONE = 'done',
}

registerEnumType(AgentChatThreadStatus, {
  name: 'AgentChatThreadStatus',
});
