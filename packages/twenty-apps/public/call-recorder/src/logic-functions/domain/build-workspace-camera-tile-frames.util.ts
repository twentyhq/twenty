import { isUndefined } from '@sniptt/guards';

import { CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH } from 'src/logic-functions/constants/camera-tile-asset-paths';
import { fetchPublicAssetOrThrow } from 'src/logic-functions/data/fetch-public-asset-or-throw.util';
import { getCameraTileFontFilePathOrThrow } from 'src/logic-functions/data/get-camera-tile-font-file-path-or-throw.util';
import { getWorkspaceBranding } from 'src/logic-functions/data/get-workspace-branding.util';
import { buildBotImage } from 'src/logic-functions/domain/build-bot-image.util';
import { buildCameraTileRecordingComposites } from 'src/logic-functions/domain/build-camera-tile-recording-composites.util';
import { buildCameraTileWorkspaceComposites } from 'src/logic-functions/domain/build-camera-tile-workspace-composites.util';
import { renderCameraTileText } from 'src/logic-functions/domain/render-camera-tile-text.util';
import { type CameraTileFrames } from 'src/logic-functions/types/camera-tile-frames.type';
import { type CameraTileTextRenderer } from 'src/logic-functions/types/camera-tile-text-renderer.type';
import { loadSharp } from 'src/logic-functions/utils/load-sharp.util';

export const buildWorkspaceCameraTileFrames = async (): Promise<
  CameraTileFrames | undefined
> => {
  const sharp = await loadSharp();

  const [fontFilePath, branding] = await Promise.all([
    getCameraTileFontFilePathOrThrow(),
    getWorkspaceBranding(),
  ]);

  const renderText: CameraTileTextRenderer = (options) =>
    renderCameraTileText({ sharp, fontFilePath, ...options });

  const composites = await buildCameraTileWorkspaceComposites({
    sharp,
    renderText,
    branding,
  });

  if (isUndefined(composites)) {
    return undefined;
  }

  const [background, recordingComposites] = await Promise.all([
    fetchPublicAssetOrThrow(CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH),
    buildCameraTileRecordingComposites({ sharp, renderText }),
  ]);

  const notRecording = await buildBotImage({ sharp, background, composites });

  if (isUndefined(notRecording)) {
    return undefined;
  }

  const recording =
    (await buildBotImage({
      sharp,
      background,
      composites: [...composites, ...recordingComposites],
    }).catch((error: unknown) => {
      console.warn(
        `[call-recorder] failed to build the recording camera tile, using the plain one: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    })) ?? notRecording;

  return { recording, notRecording };
};
