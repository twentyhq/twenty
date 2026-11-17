import { isUndefined } from '@sniptt/guards';

import { fetchPrebuiltCameraTileFramesOrThrow } from 'src/logic-functions/data/fetch-prebuilt-camera-tile-frames-or-throw.util';
import { buildRecallBotAutomaticVideoOutputFromFrames } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output-from-frames.util';
import { buildWorkspaceCameraTileFrames } from 'src/logic-functions/domain/build-workspace-camera-tile-frames.util';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { type CameraTileFrames } from 'src/logic-functions/types/camera-tile-frames.type';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';
import { getCallRecorderStyle } from 'src/logic-functions/utils/get-call-recorder-style.util';

const tryBuildCameraTileFrames = async (
  style: Exclude<CallRecorderStyle, 'NONE'>,
): Promise<CameraTileFrames | undefined> => {
  try {
    return style === 'WORKSPACE'
      ? await buildWorkspaceCameraTileFrames()
      : await fetchPrebuiltCameraTileFramesOrThrow(style);
  } catch (error) {
    console.warn(
      `[call-recorder] failed to build the camera tile, the bot keeps its current one: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

export const buildRecallBotAutomaticVideoOutputUpdate = async (): Promise<
  RecallBotAutomaticVideoOutput | null | undefined
> => {
  const style = getCallRecorderStyle();

  if (style === 'NONE') {
    return null;
  }

  const frames = await tryBuildCameraTileFrames(style);

  if (isUndefined(frames)) {
    return undefined;
  }

  return buildRecallBotAutomaticVideoOutputFromFrames(frames);
};
