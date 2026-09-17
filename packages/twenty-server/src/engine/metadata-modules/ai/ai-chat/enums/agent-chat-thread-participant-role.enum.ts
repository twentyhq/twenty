import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatThreadParticipantRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

registerEnumType(AgentChatThreadParticipantRole, {
  name: 'AgentChatThreadParticipantRole',
});
