import { type OverlayOptions } from 'sharp';

import {
  CAMERA_TILE_RECORDING_BOTTOM_INSET,
  CAMERA_TILE_RECORDING_DOT_COLOR,
  CAMERA_TILE_RECORDING_DOT_GAP,
  CAMERA_TILE_RECORDING_DOT_SIZE,
  CAMERA_TILE_RECORDING_FONT_SIZE,
  CAMERA_TILE_RECORDING_LABEL,
  CAMERA_TILE_SECONDARY_TEXT_OPACITY,
} from 'src/logic-functions/constants/camera-tile-config';
import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';
import { buildCameraTileScrimSvg } from 'src/logic-functions/domain/build-camera-tile-scrim-svg.util';
import { renderCameraTileSvgLayer } from 'src/logic-functions/domain/render-camera-tile-svg-layer.util';
import { type CameraTileTextRenderer } from 'src/logic-functions/types/camera-tile-text-renderer.type';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

export const buildCameraTileRecordingComposites = async ({
  sharp,
  renderText,
}: {
  sharp: SharpFactory;
  renderText: CameraTileTextRenderer;
}): Promise<OverlayOptions[]> => {
  const label = await renderText({
    text: CAMERA_TILE_RECORDING_LABEL,
    fontSize: CAMERA_TILE_RECORDING_FONT_SIZE,
    opacity: CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  });

  const left = Math.round(
    (RECALL_BOT_IMAGE_WIDTH -
      (CAMERA_TILE_RECORDING_DOT_SIZE +
        CAMERA_TILE_RECORDING_DOT_GAP +
        label.width)) /
      2,
  );
  const top =
    RECALL_BOT_IMAGE_HEIGHT - CAMERA_TILE_RECORDING_BOTTOM_INSET - label.height;
  const centerY = top + label.height / 2;

  return [
    await renderCameraTileSvgLayer({
      sharp,
      content:
        buildCameraTileScrimSvg({ centerY, radiusX: 200, radiusY: 44 }) +
        `<circle cx="${left + CAMERA_TILE_RECORDING_DOT_SIZE / 2}" cy="${centerY}" r="${CAMERA_TILE_RECORDING_DOT_SIZE / 2}" fill="${CAMERA_TILE_RECORDING_DOT_COLOR}"/>`,
    }),
    {
      input: label.input,
      left:
        left + CAMERA_TILE_RECORDING_DOT_SIZE + CAMERA_TILE_RECORDING_DOT_GAP,
      top,
    },
  ];
};
