import { fetchPrebuiltCameraTileFramesOrThrow } from 'src/logic-functions/data/fetch-prebuilt-camera-tile-frames-or-throw.util';
import { buildRecallBotAutomaticVideoOutputFromFrames } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output-from-frames.util';
import { buildWorkspaceCameraTileFrames } from 'src/logic-functions/domain/build-workspace-camera-tile-frames.util';
import { type CameraTileFrames } from 'src/logic-functions/types/camera-tile-frames.type';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';
import { getCallRecorderStyle } from 'src/logic-functions/utils/get-call-recorder-style.util';

const tryBuildWorkspaceCameraTileFrames = async (): Promise<
  CameraTileFrames | undefined
> => {
  try {
    return await buildWorkspaceCameraTileFrames();
  } catch (error) {
    console.warn(
      `[call-recorder] failed to build the workspace camera tile, falling back to the Twenty style: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

export const buildRecallBotAutomaticVideoOutput = async (): Promise<
  RecallBotAutomaticVideoOutput | undefined
> => {
  const style = getCallRecorderStyle();

  if (style === 'NONE') {
    return undefined;
  }

  try {
    const workspaceFrames =
      style === 'WORKSPACE'
        ? await tryBuildWorkspaceCameraTileFrames()
        : undefined;

    const frames =
      workspaceFrames ??
      (await fetchPrebuiltCameraTileFramesOrThrow(
        style === 'MINIMAL' ? 'MINIMAL' : 'TWENTY',
      ));

    return buildRecallBotAutomaticVideoOutputFromFrames(frames);
  } catch (error) {
    console.warn(
      `[call-recorder] failed to build the camera tile: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
