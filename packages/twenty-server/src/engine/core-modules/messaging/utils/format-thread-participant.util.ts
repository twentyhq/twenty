import { TimelineThreadParticipant } from 'src/engine/core-modules/messaging/dtos/timeline-thread-participant.dto';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export const formatThreadParticipant = (
  threadParticipant: MessageParticipantWorkspaceEntity,
): TimelineThreadParticipant => ({
  personId: threadParticipant.personId,
  workspaceMemberId: threadParticipant.workspaceMemberId,
  firstName:
    threadParticipant.person?.name?.firstName ||
    threadParticipant.workspaceMember?.name.firstName ||
    '',
  lastName:
    threadParticipant.person?.name?.lastName ||
    threadParticipant.workspaceMember?.name.lastName ||
    '',
  displayName:
    threadParticipant.person?.name?.firstName ||
    threadParticipant.person?.name?.lastName ||
    threadParticipant.workspaceMember?.name.firstName ||
    threadParticipant.workspaceMember?.name.lastName ||
    threadParticipant.displayName ||
    threadParticipant.handle ||
    '',
  avatarUrl:
    threadParticipant.person?.avatarUrl ||
    threadParticipant.workspaceMember?.avatarUrl ||
    '',
  handle: threadParticipant.handle,
});
