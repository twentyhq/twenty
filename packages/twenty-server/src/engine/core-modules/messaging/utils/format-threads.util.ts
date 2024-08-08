import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { extractFirstAndLastTwoActiveParticipants } from 'src/engine/core-modules/messaging/utils/extract-first-and-last-two-participants.util';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

export const formatThreads = (
  threads: MessageThreadWorkspaceEntity[],
  threadParticipantsByThreadId: any,
  threadVisibilityByThreadId: any,
): TimelineThread[] => {
  return threads.map((thread) => ({
    ...thread,
    ...extractFirstAndLastTwoActiveParticipants(
      threadParticipantsByThreadId[thread.id],
    ),
    visibility: threadVisibilityByThreadId[thread.id],
  }));
};
