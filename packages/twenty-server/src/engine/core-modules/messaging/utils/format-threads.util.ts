import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { extractFirstAndLastTwoActiveParticipants } from 'src/engine/core-modules/messaging/utils/extract-first-and-last-two-participants.util';

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
    ...extractFirstAndLastTwoActiveParticipants(
      threadParticipantsByThreadId[thread.id],
    ),
    participantCount: threadParticipantsByThreadId[thread.id].length,
    visibility: threadVisibilityByThreadId[thread.id],
    read: true,
  }));
};
