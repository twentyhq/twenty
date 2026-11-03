import { type OverlayOptions } from 'sharp';

import {
  CAMERA_TILE_TEXT_TOP,
  CAMERA_TILE_TITLE_LINE_HEIGHT,
} from 'src/logic-functions/constants/camera-tile-config';
import { buildCameraTileScrimSvg } from 'src/logic-functions/domain/build-camera-tile-scrim-svg.util';
import { centerCameraTileItem } from 'src/logic-functions/domain/center-camera-tile-item.util';
import { type CameraTileText } from 'src/logic-functions/domain/render-camera-tile-text.util';

export const buildCameraTileTextBlock = ({
  title,
}: {
  title: CameraTileText;
}): { lineComposites: OverlayOptions[]; scrimSvg: string } => ({
  lineComposites: [
    centerCameraTileItem({ item: title, top: CAMERA_TILE_TEXT_TOP }),
  ],
  scrimSvg: buildCameraTileScrimSvg({
    centerY: CAMERA_TILE_TEXT_TOP + CAMERA_TILE_TITLE_LINE_HEIGHT / 2,
    radiusX: title.width / 2 + 160,
    radiusY: CAMERA_TILE_TITLE_LINE_HEIGHT / 2 + 50,
  }),
});
