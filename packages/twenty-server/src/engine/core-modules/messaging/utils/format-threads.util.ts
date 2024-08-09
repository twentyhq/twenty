import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { extractParticipantSummary } from 'src/engine/core-modules/messaging/utils/extract-participant-summary.util';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export const formatThreads = (
  threads: Omit<
    TimelineThread,
    | 'firstParticipant'
    | 'lastTwoParticipants'
    | 'participantCount'
    | 'read'
    | 'visibility'
  >[],
  threadParticipantsByThreadId: {
    [key: string]: MessageParticipantWorkspaceEntity[];
  },
  threadVisibilityByThreadId: {
    [key: string]: MessageChannelVisibility;
  },
): TimelineThread[] => {
  return threads.map((thread) => ({
    ...thread,
    ...extractParticipantSummary(threadParticipantsByThreadId[thread.id]),
    visibility: threadVisibilityByThreadId[thread.id],
    read: true,
  }));
};
