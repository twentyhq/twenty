import { isUndefined } from '@sniptt/guards';

import { getBotImageBackground } from 'src/logic-functions/constants/get-bot-image-background';
import { isWorkspaceLogoBotImageEnabled } from 'src/logic-functions/constants/is-workspace-logo-bot-image-enabled';
import { getWorkspaceLogo } from 'src/logic-functions/data/get-workspace-logo.util';
import { buildBotImage } from 'src/logic-functions/domain/build-bot-image.util';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';

export const buildRecallBotAutomaticVideoOutput = async (): Promise<
  RecallBotAutomaticVideoOutput | undefined
> => {
  if (!isWorkspaceLogoBotImageEnabled()) {
    return undefined;
  }

  const logoBuffer = await getWorkspaceLogo();

  if (isUndefined(logoBuffer)) {
    return undefined;
  }

  const background = getBotImageBackground();

  const notRecordingImage = await buildBotImage({ logoBuffer, background });

  if (isUndefined(notRecordingImage)) {
    return undefined;
  }

  // The recording state carries a recording dot; fall back to the plain image if
  // the badged variant fails to build.
  const recordingImage =
    (await buildBotImage({ logoBuffer, background, withRecordingBadge: true })) ??
    notRecordingImage;

  return {
    in_call_recording: { kind: 'jpeg', b64_data: recordingImage },
    in_call_not_recording: { kind: 'jpeg', b64_data: notRecordingImage },
  };
};
