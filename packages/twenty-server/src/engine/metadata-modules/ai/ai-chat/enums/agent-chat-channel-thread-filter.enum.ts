import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatChannelThreadFilter {
  ANY = 'ANY',
  NEEDS_INPUT = 'NEEDS_INPUT',
  MENTIONED = 'MENTIONED',
}

registerEnumType(AgentChatChannelThreadFilter, {
  name: 'AgentChatChannelThreadFilter',
});
