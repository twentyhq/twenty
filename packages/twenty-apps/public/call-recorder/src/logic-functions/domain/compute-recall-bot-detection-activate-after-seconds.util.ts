import { RECALL_BOT_DETECTION_GRACE_AFTER_MEETING_START_SECONDS } from 'src/logic-functions/constants/recall-bot-detection-timeouts';

const MILLISECONDS_PER_SECOND = 1_000;

export const computeRecallBotDetectionActivateAfterSeconds = ({
  botJoinsAt,
  meetingStartsAt,
}: {
  botJoinsAt: string;
  meetingStartsAt: string;
}): number => {
  const millisecondsUntilMeetingStarts =
    new Date(meetingStartsAt).getTime() - new Date(botJoinsAt).getTime();

  const secondsUntilMeetingStarts = Math.max(
    0,
    Math.ceil(millisecondsUntilMeetingStarts / MILLISECONDS_PER_SECOND),
  );

  return (
    secondsUntilMeetingStarts +
    RECALL_BOT_DETECTION_GRACE_AFTER_MEETING_START_SECONDS
  );
};
