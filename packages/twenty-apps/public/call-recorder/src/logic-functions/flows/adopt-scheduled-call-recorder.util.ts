import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { findScheduledRecallBotIdForCallRecording } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-id-for-call-recording.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

// Wide enough to contain any configured join-early offset around the meeting start.
const ADOPTION_JOIN_AT_LOOKBACK_HOURS = 24;
const ADOPTION_JOIN_AT_LOOKAHEAD_HOURS = 1;

// A run that POSTed a bot but died before the id write-back leaves the bot claimable by metadata; adopting it instead of re-POSTing prevents duplicate bots.
export const adoptScheduledCallRecorder = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<boolean> => {
  const workspaceId = getCurrentWorkspaceId();
  const meetingStartsAt = calendarEvent.startsAt;

  if (isUndefined(workspaceId) || isUndefined(meetingStartsAt)) {
    return false;
  }

  const meetingStartTime = new Date(meetingStartsAt).getTime();

  if (Number.isNaN(meetingStartTime)) {
    return false;
  }

  const externalBotId = await findScheduledRecallBotIdForCallRecording({
    callRecordingId: callRecording.id,
    workspaceId,
    joinAtAfter: new Date(
      meetingStartTime - ADOPTION_JOIN_AT_LOOKBACK_HOURS * 60 * 60 * 1000,
    ).toISOString(),
    joinAtBefore: new Date(
      meetingStartTime + ADOPTION_JOIN_AT_LOOKAHEAD_HOURS * 60 * 60 * 1000,
    ).toISOString(),
  });

  if (isUndefined(externalBotId)) {
    return false;
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: { externalBotId },
  });

  return true;
};
