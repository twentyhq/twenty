import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatChannelVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

registerEnumType(AgentChatChannelVisibility, {
  name: 'AgentChatChannelVisibility',
});
