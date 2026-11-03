import { isDefined } from 'twenty-sdk/utils';
import { type OverlayOptions } from 'sharp';

import {
  CAMERA_TILE_SUBTITLE_LINE_HEIGHT,
  CAMERA_TILE_TEXT_LINE_GAP,
  CAMERA_TILE_TEXT_TOP,
  CAMERA_TILE_TITLE_LINE_HEIGHT,
} from 'src/logic-functions/constants/camera-tile-config';
import { buildCameraTileScrimSvg } from 'src/logic-functions/domain/build-camera-tile-scrim-svg.util';
import { centerCameraTileItem } from 'src/logic-functions/domain/center-camera-tile-item.util';
import { type CameraTileText } from 'src/logic-functions/domain/render-camera-tile-text.util';

const SUBTITLE_TOP =
  CAMERA_TILE_TEXT_TOP +
  CAMERA_TILE_TITLE_LINE_HEIGHT +
  CAMERA_TILE_TEXT_LINE_GAP;

export const buildCameraTileTextBlock = ({
  title,
  subtitle,
}: {
  title: CameraTileText;
  subtitle?: CameraTileText;
}): { lineComposites: OverlayOptions[]; scrimSvg: string } => {
  const blockHeight = isDefined(subtitle)
    ? SUBTITLE_TOP + CAMERA_TILE_SUBTITLE_LINE_HEIGHT - CAMERA_TILE_TEXT_TOP
    : CAMERA_TILE_TITLE_LINE_HEIGHT;
  const blockWidth = Math.max(title.width, subtitle?.width ?? 0);

  return {
    lineComposites: [
      centerCameraTileItem({ item: title, top: CAMERA_TILE_TEXT_TOP }),
      ...(isDefined(subtitle)
        ? [centerCameraTileItem({ item: subtitle, top: SUBTITLE_TOP })]
        : []),
    ],
    scrimSvg: buildCameraTileScrimSvg({
      centerY: CAMERA_TILE_TEXT_TOP + blockHeight / 2,
      radiusX: blockWidth / 2 + 160,
      radiusY: blockHeight / 2 + 50,
    }),
  };
};
