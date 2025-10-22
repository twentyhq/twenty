import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { extractParticipantSummary } from 'src/engine/core-modules/messaging/utils/extract-participant-summary.util';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export const formatThreads = (
  threads: Omit<
    TimelineThreadDTO,
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
): TimelineThreadDTO[] => {
  return threads.map((thread) => {
    const visibility = threadVisibilityByThreadId[thread.id];

    return {
      ...thread,
      subject:
        visibility === MessageChannelVisibility.SHARE_EVERYTHING ||
        visibility === MessageChannelVisibility.SUBJECT
          ? thread.subject
          : FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      lastMessageBody:
        visibility === MessageChannelVisibility.SHARE_EVERYTHING
          ? thread.lastMessageBody
          : FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ...extractParticipantSummary(threadParticipantsByThreadId[thread.id]),
      visibility,
      read: true,
    };
  });
};
