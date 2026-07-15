import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { findScheduledRecallBotIdForCallRecording } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-id-for-call-recording.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

const ATTACH_JOIN_AT_LOOKBACK_HOURS = 24;
const ATTACH_JOIN_AT_LOOKAHEAD_HOURS = 1;

export type AttachExistingRecallBotToCallRecordingResult =
  | 'attached'
  | 'no-existing-bot'
  | 'lookup-failed';

// A run that POSTed a bot but died before the id write-back leaves the bot claimable by metadata; attaching it instead of re-POSTing prevents duplicate bots.
export const attachExistingRecallBotToCallRecording = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<AttachExistingRecallBotToCallRecordingResult> => {
  const workspaceId = getCurrentWorkspaceId();
  const meetingStartsAt = calendarEvent.startsAt;

  if (isUndefined(workspaceId) || isUndefined(meetingStartsAt)) {
    return 'no-existing-bot';
  }

  const meetingStartTime = new Date(meetingStartsAt).getTime();

  if (Number.isNaN(meetingStartTime)) {
    return 'no-existing-bot';
  }

  const scheduledJoinAtTime = new Date(
    computeRecallBotJoinAt(meetingStartsAt),
  ).getTime();
  const lookbackFloorTime =
    meetingStartTime - ATTACH_JOIN_AT_LOOKBACK_HOURS * 60 * 60 * 1000;

  const findResult = await findScheduledRecallBotIdForCallRecording({
    callRecordingId: callRecording.id,
    workspaceId,
    joinAtAfter: new Date(
      Math.min(scheduledJoinAtTime, lookbackFloorTime),
    ).toISOString(),
    joinAtBefore: new Date(
      meetingStartTime + ATTACH_JOIN_AT_LOOKAHEAD_HOURS * 60 * 60 * 1000,
    ).toISOString(),
  });

  if (!findResult.ok) {
    return 'lookup-failed';
  }

  if (isUndefined(findResult.externalBotId)) {
    return 'no-existing-bot';
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: { externalBotId: findResult.externalBotId },
  });

  return 'attached';
};
