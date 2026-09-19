import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatChannelVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

registerEnumType(AgentChatChannelVisibility, {
  name: 'AgentChatChannelVisibility',
});
