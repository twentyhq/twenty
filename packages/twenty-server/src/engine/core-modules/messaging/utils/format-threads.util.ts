import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { extractParticipantSummary } from 'src/engine/core-modules/messaging/utils/extract-participant-summary.util';

export const formatThreads = (
  threads: Omit<
    TimelineThread,
    | 'firstParticipant'
    | 'lastTwoParticipants'
    | 'participantCount'
    | 'read'
    | 'visibility'
  >[],
  threadParticipantsByThreadId: any,
  threadVisibilityByThreadId: any,
): TimelineThread[] => {
  return threads.map((thread) => ({
    ...thread,
    ...extractParticipantSummary(threadParticipantsByThreadId[thread.id]),
    visibility: threadVisibilityByThreadId[thread.id],
    read: true,
  }));
};
