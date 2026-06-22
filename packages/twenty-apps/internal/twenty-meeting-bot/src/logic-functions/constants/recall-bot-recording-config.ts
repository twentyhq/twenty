import { DEFAULT_MEETING_BOT_RECORDING_RETENTION_DAYS } from 'src/logic-functions/constants/default-meeting-bot-recording-retention-days';
import { MEETING_BOT_RECORDING_RETENTION_DAYS_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-recording-retention-days-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type RecallBotRecordingRetention =
  | { type: 'timed'; hours: number }
  | { type: 'never_delete' };

type RecallBotRecordingConfig = {
  video_mixed_mp4: Record<string, never>;
  audio_mixed_mp3: Record<string, never>;
  retention: RecallBotRecordingRetention;
};

// Recall only produces artifacts declared at bot creation; both gate COMPLETED.
export const getRecallBotRecordingConfig = (): RecallBotRecordingConfig => {
  const rawValue = getApplicationVariableValue(
    MEETING_BOT_RECORDING_RETENTION_DAYS_ENV_VAR_NAME,
  );

  const retentionDays = isNonEmptyString(rawValue)
    ? Number(rawValue.trim())
    : NaN;

  const days =
    Number.isInteger(retentionDays) && retentionDays > 0
      ? retentionDays
      : DEFAULT_MEETING_BOT_RECORDING_RETENTION_DAYS;

  return {
    video_mixed_mp4: {},
    audio_mixed_mp3: {},
    retention: { type: 'timed', hours: days * 24 },
  };
};
