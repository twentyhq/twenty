// https://developers.line.biz/en/reference/messaging-api/#image-message
export const LINE_OUTGOING_IMAGE_LIMITS = {
  contentTypes: ['image/jpeg', 'image/png'],
  maxSizeBytes: 10 * 1024 * 1024,
  maxUrlLength: 2000,
} as const;
