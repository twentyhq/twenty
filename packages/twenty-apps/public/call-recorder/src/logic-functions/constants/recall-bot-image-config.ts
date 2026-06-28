// Recall outputs the bot image as a camera video frame. Meeting platforms accept
// at most 1280x720, so we target that 16:9 size and keep the logo within a
// centered safezone box so it stays visible across adaptive participant tiles.
export const RECALL_BOT_IMAGE_WIDTH = 1280;
export const RECALL_BOT_IMAGE_HEIGHT = 720;
export const RECALL_BOT_IMAGE_LOGO_MAX_WIDTH = 760;
export const RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT = 420;
export const RECALL_BOT_IMAGE_JPEG_QUALITY = 90;
export const RECALL_BOT_IMAGE_MIN_JPEG_QUALITY = 40;
// Recall rejects images above 1.3MB; stay just under it.
export const RECALL_BOT_IMAGE_MAX_BYTES = 1_300_000;
