import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

const formatThreads = (
  threads: MessageThreadWorkspaceEntity[],
  threadParticipantsByThreadId: any,
  threadVisibilityByThreadId: any,
): TimelineThread[] => {
  return threads.map((thread) => ({
    ...thread,
    participants: threadParticipantsByThreadId[thread.id],
    visibility: threadVisibilityByThreadId[thread.id],
  }));
};
