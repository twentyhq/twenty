// https://developers.facebook.com/docs/messenger-platform/send-messages/saving-assets
export const MESSENGER_ATTACHMENT_MAX_SIZE_BYTES = {
  image: 8 * 1024 * 1024,
  other: 25 * 1024 * 1024,
} as const;
