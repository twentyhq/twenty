import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageParticipantRole } from 'twenty-shared/types';

export const filterActiveParticipants = (
  participants: MessageParticipantWorkspaceEntity[],
): MessageParticipantWorkspaceEntity[] => {
  return participants.filter((participant) => participant.role === MessageParticipantRole.FROM);
};
