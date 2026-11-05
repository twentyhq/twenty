import { CAMERA_TILE_BACKGROUND_COLOR } from 'src/logic-functions/constants/camera-tile-config';
import { RECALL_BOT_IMAGE_WIDTH } from 'src/logic-functions/constants/recall-bot-image-config';

export const buildCameraTileScrimSvg = ({
  centerY,
  radiusX,
  radiusY,
}: {
  centerY: number;
  radiusX: number;
  radiusY: number;
}): string =>
  [
    '<defs><radialGradient id="scrim" cx="50%" cy="50%" r="50%">',
    `<stop offset="0.45" stop-color="${CAMERA_TILE_BACKGROUND_COLOR}" stop-opacity="0.94"/>`,
    `<stop offset="1" stop-color="${CAMERA_TILE_BACKGROUND_COLOR}" stop-opacity="0"/>`,
    '</radialGradient></defs>',
    `<ellipse cx="${RECALL_BOT_IMAGE_WIDTH / 2}" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" fill="url(#scrim)"/>`,
  ].join('');
