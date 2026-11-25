import { type OverlayOptions } from 'sharp';

import { RECALL_BOT_IMAGE_WIDTH } from 'src/logic-functions/constants/recall-bot-image-config';

export const centerCameraTileItem = ({
  item,
  top,
}: {
  item: { input: Buffer; width: number };
  top: number;
}): OverlayOptions => ({
  input: item.input,
  left: Math.round((RECALL_BOT_IMAGE_WIDTH - item.width) / 2),
  top: Math.round(top),
});
