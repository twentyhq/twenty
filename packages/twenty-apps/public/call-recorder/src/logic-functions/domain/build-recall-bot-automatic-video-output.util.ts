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

  const workspaceLogo = await getWorkspaceLogo();

  if (isUndefined(workspaceLogo)) {
    return undefined;
  }

  const base64Jpeg = await buildBotImage({
    logoBuffer: workspaceLogo.buffer,
    background: getBotImageBackground(),
  });

  if (isUndefined(base64Jpeg)) {
    return undefined;
  }

  const videoFrame = { kind: 'jpeg', b64_data: base64Jpeg } as const;

  return {
    in_call_recording: videoFrame,
    in_call_not_recording: videoFrame,
  };
};
