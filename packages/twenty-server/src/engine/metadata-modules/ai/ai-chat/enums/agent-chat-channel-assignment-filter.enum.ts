import { registerEnumType } from '@nestjs/graphql';

export enum AgentChatChannelAssignmentFilter {
  ANY = 'ANY',
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED_TO_ME = 'ASSIGNED_TO_ME',
}

registerEnumType(AgentChatChannelAssignmentFilter, {
  name: 'AgentChatChannelAssignmentFilter',
});
