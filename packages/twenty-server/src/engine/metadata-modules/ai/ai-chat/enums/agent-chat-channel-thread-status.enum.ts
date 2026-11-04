import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatChannelThreadStatus {
  OPEN = 'OPEN',
  SNOOZED = 'SNOOZED',
  DONE = 'DONE',
}

registerEnumType(AgentChatChannelThreadStatus, {
  name: 'AgentChatChannelThreadStatus',
});
