import { buildRecallBotAutomaticVideoOutputUpdate } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output-update.util';
import { isRecallBotBookedJoinAtCurrent } from 'src/logic-functions/domain/is-recall-bot-booked-join-at-current.util';
import { isRecallBotJoinWithinSettingsUpdateCutoff } from 'src/logic-functions/domain/is-recall-bot-join-within-settings-update-cutoff.util';
import { updateRecallBotSettings } from 'src/logic-functions/recall-api/update-recall-bot-settings.util';

const warnSettingsNotApplied = ({
  callRecordingId,
  errorMessage,
}: {
  callRecordingId: string;
  errorMessage: string;
}): void => {
  console.warn(
    `[call-recorder] failed to apply the current settings to the Recall bot for callRecording ${callRecordingId}; the bot keeps its previous settings: ${errorMessage}`,
  );
};

export const applyCallRecorderSettingsToRecallBot = async ({
  callRecordingId,
  externalBotId,
  meetingStartsAt,
  joinAt,
  bookedJoinAt,
  now,
}: {
  callRecordingId: string;
  externalBotId: string;
  meetingStartsAt: string;
  joinAt: string;
  bookedJoinAt: string | undefined;
  now: Date;
}): Promise<void> => {
  if (isRecallBotJoinWithinSettingsUpdateCutoff({ joinAt, now })) {
    console.warn(
      `[call-recorder] skipped the settings update for the Recall bot of callRecording ${callRecordingId}: the bot joins too soon for Recall to apply it`,
    );

    return;
  }

  if (
    !isRecallBotBookedJoinAtCurrent({ bookedJoinAt, currentJoinAt: joinAt })
  ) {
    console.warn(
      `[call-recorder] skipped the settings update for the Recall bot of callRecording ${callRecordingId}: the bot's booked join time no longer matches the current one`,
    );

    return;
  }

  try {
    const updateResult = await updateRecallBotSettings({
      externalBotId,
      meetingStartsAt,
      joinAt,
      automaticVideoOutput: await buildRecallBotAutomaticVideoOutputUpdate(),
    });

    if (!updateResult.ok) {
      warnSettingsNotApplied({
        callRecordingId,
        errorMessage: updateResult.errorMessage,
      });
    }
  } catch (error) {
    warnSettingsNotApplied({
      callRecordingId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
};
