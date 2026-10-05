import { COMPANION_RECORDING_RETENTION_HOURS_ENV_VAR_NAME } from 'src/logic-functions/constants/COMPANION_RECORDING_RETENTION_HOURS_ENV_VAR_NAME';
import { DEFAULT_COMPANION_RECORDING_RETENTION_HOURS } from 'src/logic-functions/constants/DEFAULT_COMPANION_RECORDING_RETENTION_HOURS';
import { getApplicationVariableValue } from 'src/logic-functions/utils/getApplicationVariableValue';
import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';

type RecallBotRecordingConfig = {
  video_mixed_mp4: Record<string, never>;
  audio_mixed_mp3: Record<string, never>;
  retention: { type: 'timed'; hours: number };
};

// Recall only produces artifacts declared at bot creation; both gate COMPLETED.
export const getRecallBotRecordingConfig = (): RecallBotRecordingConfig => {
  const configuredRecordingRetentionHours = getApplicationVariableValue(
    COMPANION_RECORDING_RETENTION_HOURS_ENV_VAR_NAME,
  );

  const recordingRetentionHours = isNonEmptyString(
    configuredRecordingRetentionHours,
  )
    ? Number(configuredRecordingRetentionHours.trim())
    : NaN;

  const resolvedRecordingRetentionHours =
    Number.isInteger(recordingRetentionHours) && recordingRetentionHours > 0
      ? recordingRetentionHours
      : DEFAULT_COMPANION_RECORDING_RETENTION_HOURS;

  return {
    video_mixed_mp4: {},
    audio_mixed_mp3: {},
    retention: { type: 'timed', hours: resolvedRecordingRetentionHours },
  };
};
