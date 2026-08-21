import { isUndefined } from '@sniptt/guards';

import { type RecallRoutingMetadata } from 'src/logic-functions/types/recall-routing-metadata.type';

export const buildRecallRoutingMetadata = ({
  callRecordingId,
  workspaceId,
  botScheduleAttemptId,
}: {
  callRecordingId: string;
  workspaceId: string;
  botScheduleAttemptId?: string;
}): RecallRoutingMetadata => ({
  twentyWorkspaceId: workspaceId,
  twentyCallRecordingId: callRecordingId,
  ...(isUndefined(botScheduleAttemptId)
    ? {}
    : { twentyBotScheduleAttemptId: botScheduleAttemptId }),
});
