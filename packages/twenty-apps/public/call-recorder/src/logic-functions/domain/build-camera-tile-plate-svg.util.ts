import {
  CAMERA_TILE_PLATE_COLOR,
  CAMERA_TILE_PLATE_RADIUS,
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_STROKE_COLOR,
  CAMERA_TILE_PLATE_TOP,
} from 'src/logic-functions/constants/camera-tile-config';
import { RECALL_BOT_IMAGE_WIDTH } from 'src/logic-functions/constants/recall-bot-image-config';

export const buildCameraTilePlateSvg = (): string => {
  const left = (RECALL_BOT_IMAGE_WIDTH - CAMERA_TILE_PLATE_SIZE) / 2;
  const plate = `x="${left}" y="${CAMERA_TILE_PLATE_TOP}" width="${CAMERA_TILE_PLATE_SIZE}" height="${CAMERA_TILE_PLATE_SIZE}" rx="${CAMERA_TILE_PLATE_RADIUS}"`;

  return [
    '<defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feGaussianBlur in="SourceAlpha" stdDeviation="26"/><feOffset dy="16"/>',
    '<feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>',
    '</filter></defs>',
    `<rect ${plate} fill="#000" filter="url(#shadow)"/>`,
    `<rect ${plate} fill="${CAMERA_TILE_PLATE_COLOR}" stroke="${CAMERA_TILE_PLATE_STROKE_COLOR}" stroke-width="2"/>`,
  ].join('');
};
