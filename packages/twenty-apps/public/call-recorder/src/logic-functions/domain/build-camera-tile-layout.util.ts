import { type OverlayOptions } from 'sharp';
import { isDefined } from 'twenty-sdk/utils';

import {
  CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
  CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
} from 'src/logic-functions/constants/camera-tile-asset-paths';
import {
  CAMERA_TILE_MINIMAL_FONT_SIZE,
  CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  CAMERA_TILE_SUBTITLE_FONT_SIZE,
  CAMERA_TILE_TITLE_FONT_SIZE,
  CAMERA_TILE_TWENTY_SUBTITLE,
  CAMERA_TILE_TWENTY_TITLE,
} from 'src/logic-functions/constants/camera-tile-config';
import { RECALL_BOT_IMAGE_HEIGHT } from 'src/logic-functions/constants/recall-bot-image-config';
import { type WorkspaceBranding } from 'src/logic-functions/data/get-workspace-branding.util';
import { buildCameraTileRecordingComposites } from 'src/logic-functions/domain/build-camera-tile-recording-composites.util';
import { buildCameraTileTextBlock } from 'src/logic-functions/domain/build-camera-tile-text-block.util';
import { buildCameraTileWorkspaceComposites } from 'src/logic-functions/domain/build-camera-tile-workspace-composites.util';
import { centerCameraTileItem } from 'src/logic-functions/domain/center-camera-tile-item.util';
import { renderCameraTileSvgLayer } from 'src/logic-functions/domain/render-camera-tile-svg-layer.util';
import { renderCameraTileText } from 'src/logic-functions/domain/render-camera-tile-text.util';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { type CameraTileTextRenderer } from 'src/logic-functions/types/camera-tile-text-renderer.type';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

export type CameraTileLayout = {
  backgroundAssetPath: string | undefined;
  composites: OverlayOptions[];
  recordingComposites: OverlayOptions[];
};

export const buildCameraTileLayout = async ({
  sharp,
  style,
  branding,
  fontFilePath,
}: {
  sharp: SharpFactory;
  style: Exclude<CallRecorderStyle, 'NONE'>;
  branding: WorkspaceBranding | undefined;
  fontFilePath: string;
}): Promise<CameraTileLayout> => {
  const renderText: CameraTileTextRenderer = (options) =>
    renderCameraTileText({ sharp, fontFilePath, ...options });

  const recordingComposites = await buildCameraTileRecordingComposites({
    sharp,
    renderText,
  });

  if (style === 'MINIMAL') {
    const word = await renderText({
      text: CAMERA_TILE_TWENTY_TITLE,
      fontSize: CAMERA_TILE_MINIMAL_FONT_SIZE,
    });

    return {
      backgroundAssetPath: undefined,
      composites: [
        centerCameraTileItem({
          item: word,
          top: (RECALL_BOT_IMAGE_HEIGHT - word.height) / 2,
        }),
      ],
      recordingComposites,
    };
  }

  const workspaceComposites =
    style === 'WORKSPACE'
      ? await buildCameraTileWorkspaceComposites({
          sharp,
          renderText,
          branding,
        })
      : undefined;

  if (isDefined(workspaceComposites)) {
    return {
      backgroundAssetPath: CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
      composites: workspaceComposites,
      recordingComposites,
    };
  }

  const { lineComposites, scrimSvg } = buildCameraTileTextBlock({
    title: await renderText({
      text: CAMERA_TILE_TWENTY_TITLE,
      fontSize: CAMERA_TILE_TITLE_FONT_SIZE,
    }),
    subtitle: await renderText({
      text: CAMERA_TILE_TWENTY_SUBTITLE,
      fontSize: CAMERA_TILE_SUBTITLE_FONT_SIZE,
      opacity: CAMERA_TILE_SECONDARY_TEXT_OPACITY,
    }),
  });

  return {
    backgroundAssetPath: CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
    composites: [
      await renderCameraTileSvgLayer({ sharp, content: scrimSvg }),
      ...lineComposites,
    ],
    recordingComposites,
  };
};
