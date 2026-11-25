import { type PrebuiltCallRecorderStyle } from 'src/logic-functions/types/prebuilt-call-recorder-style.type';

export const CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS: Record<
  PrebuiltCallRecorderStyle,
  { recording: string; notRecording: string }
> = {
  TWENTY: {
    recording: 'camera-tile/frames/twenty-recording.jpg',
    notRecording: 'camera-tile/frames/twenty-not-recording.jpg',
  },
  MINIMAL: {
    recording: 'camera-tile/frames/minimal-recording.jpg',
    notRecording: 'camera-tile/frames/minimal-not-recording.jpg',
  },
};

export const CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH =
  'camera-tile/workspace-background.png';

export const CAMERA_TILE_FONT_ASSET_PATH = 'fonts/Inter-SemiBold.ttf';
