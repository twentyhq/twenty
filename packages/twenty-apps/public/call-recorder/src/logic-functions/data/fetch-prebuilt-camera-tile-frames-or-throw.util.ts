import { CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS } from 'src/logic-functions/constants/camera-tile-asset-paths';
import { fetchPublicAssetOrThrow } from 'src/logic-functions/data/fetch-public-asset-or-throw.util';
import { type CameraTileFrames } from 'src/logic-functions/types/camera-tile-frames.type';
import { type PrebuiltCallRecorderStyle } from 'src/logic-functions/types/prebuilt-call-recorder-style.type';

export const fetchPrebuiltCameraTileFramesOrThrow = async (
  style: PrebuiltCallRecorderStyle,
): Promise<CameraTileFrames> => {
  const assetPaths = CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS[style];

  const [recording, notRecording] = await Promise.all([
    fetchPublicAssetOrThrow(assetPaths.recording),
    fetchPublicAssetOrThrow(assetPaths.notRecording),
  ]);

  return {
    recording: recording.toString('base64'),
    notRecording: notRecording.toString('base64'),
  };
};
