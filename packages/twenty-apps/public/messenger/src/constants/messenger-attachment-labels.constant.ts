// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messages
export const MESSENGER_FILE_ATTACHMENT_TYPES = [
  'image',
  'video',
  'audio',
  'file',
  'sticker',
];

// these carry a link to content on Facebook or Instagram, not a file to download
export const MESSENGER_SHARED_CONTENT_LABELS: Record<string, string> = {
  fallback: 'Shared link',
  post: 'Shared post',
  ig_post: 'Shared Instagram post',
  reel: 'Shared reel',
  ig_reel: 'Shared Instagram reel',
};
