import { type OverlayOptions } from 'sharp';

import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

export const renderCameraTileSvgLayer = async ({
  sharp,
  content,
}: {
  sharp: SharpFactory;
  content: string;
}): Promise<OverlayOptions> => ({
  input: await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${RECALL_BOT_IMAGE_WIDTH}" height="${RECALL_BOT_IMAGE_HEIGHT}">${content}</svg>`,
    ),
  )
    .png()
    .toBuffer(),
  left: 0,
  top: 0,
});
