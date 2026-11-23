import { type CameraTileFrames } from 'src/logic-functions/types/camera-tile-frames.type';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';

export const buildRecallBotAutomaticVideoOutputFromFrames = (
  frames: CameraTileFrames,
): RecallBotAutomaticVideoOutput => ({
  in_call_recording: { kind: 'jpeg', b64_data: frames.recording },
  in_call_not_recording: { kind: 'jpeg', b64_data: frames.notRecording },
});
