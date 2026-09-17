import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatChannelMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

registerEnumType(AgentChatChannelMemberRole, {
  name: 'AgentChatChannelMemberRole',
});
