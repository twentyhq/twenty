import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export const filterActiveParticipants = (
  participants: MessageParticipantWorkspaceEntity[],
): MessageParticipantWorkspaceEntity[] => {
  return participants.filter((participant) => participant.role === 'from');
};
