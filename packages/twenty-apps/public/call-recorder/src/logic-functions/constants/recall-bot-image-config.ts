// Meeting platforms cap the bot's camera output at 1280x720; the logo box stays
// within a centered safezone so it survives adaptive participant tile cropping.
export const RECALL_BOT_IMAGE_WIDTH = 1280;
export const RECALL_BOT_IMAGE_HEIGHT = 720;
export const RECALL_BOT_IMAGE_LOGO_MAX_WIDTH = 760;
export const RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT = 420;
export const RECALL_BOT_IMAGE_JPEG_QUALITY = 90;
export const RECALL_BOT_IMAGE_MIN_JPEG_QUALITY = 40;
// Recall rejects images above 1.3MB; stay just under it.
export const RECALL_BOT_IMAGE_MAX_BYTES = 1_300_000;
export const RECALL_BOT_IMAGE_BADGE_DIAMETER = 72;
export const RECALL_BOT_IMAGE_BADGE_INSET = 56;
