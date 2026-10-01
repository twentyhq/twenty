import { isDefined } from 'twenty-shared/utils';

import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { type TimelineThreadWithoutParticipants } from 'src/engine/core-modules/messaging/types/timeline-thread-without-participants.type';
import { extractParticipantSummary } from 'src/engine/core-modules/messaging/utils/extract-participant-summary.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export const formatThreads = (
  threads: TimelineThreadWithoutParticipants[],
  threadParticipantsByThreadId: {
    [key: string]: MessageParticipantWorkspaceEntity[];
  },
): TimelineThreadDTO[] =>
  threads
    .filter((thread) => isDefined(threadParticipantsByThreadId[thread.id]))
    .map((thread) => ({
      ...thread,
      ...extractParticipantSummary(threadParticipantsByThreadId[thread.id]),
      read: true,
    }));
