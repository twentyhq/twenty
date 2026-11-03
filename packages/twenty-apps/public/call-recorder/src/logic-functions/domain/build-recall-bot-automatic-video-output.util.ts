import { fetchPrebuiltCameraTileFramesOrThrow } from 'src/logic-functions/data/fetch-prebuilt-camera-tile-frames-or-throw.util';
import { buildWorkspaceCameraTileFrames } from 'src/logic-functions/domain/build-workspace-camera-tile-frames.util';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';
import { getCallRecorderStyle } from 'src/logic-functions/utils/get-call-recorder-style.util';

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
        ? await buildWorkspaceCameraTileFrames()
        : undefined;

    const frames =
      workspaceFrames ??
      (await fetchPrebuiltCameraTileFramesOrThrow(
        style === 'MINIMAL' ? 'MINIMAL' : 'TWENTY',
      ));

    return {
      in_call_recording: { kind: 'jpeg', b64_data: frames.recording },
      in_call_not_recording: { kind: 'jpeg', b64_data: frames.notRecording },
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to build the camera tile: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
