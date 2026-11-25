// https://developers.line.biz/en/reference/messaging-api/#image-message
export const LINE_OUTGOING_IMAGE_LIMITS = {
  contentTypes: ['image/jpeg', 'image/png'],
  // the file also serves as the preview image, which LINE caps at 1 MB
  maxSizeBytes: 1 * 1024 * 1024,
  maxUrlLength: 2000,
} as const;
