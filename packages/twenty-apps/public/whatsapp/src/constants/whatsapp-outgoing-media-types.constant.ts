const MEGABYTE = 1024 * 1024;

// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media#supported-media-types
export const WHATSAPP_OUTGOING_MEDIA_TYPES: Record<
  string,
  { messageType: 'image' | 'video' | 'audio' | 'document'; maxSizeBytes: number }
> = {
  'image/jpeg': { messageType: 'image', maxSizeBytes: 5 * MEGABYTE },
  'image/png': { messageType: 'image', maxSizeBytes: 5 * MEGABYTE },
  'video/mp4': { messageType: 'video', maxSizeBytes: 16 * MEGABYTE },
  'video/3gpp': { messageType: 'video', maxSizeBytes: 16 * MEGABYTE },
  'audio/aac': { messageType: 'audio', maxSizeBytes: 16 * MEGABYTE },
  'audio/amr': { messageType: 'audio', maxSizeBytes: 16 * MEGABYTE },
  'audio/mpeg': { messageType: 'audio', maxSizeBytes: 16 * MEGABYTE },
  'audio/mp4': { messageType: 'audio', maxSizeBytes: 16 * MEGABYTE },
  'audio/ogg': { messageType: 'audio', maxSizeBytes: 16 * MEGABYTE },
  'text/plain': { messageType: 'document', maxSizeBytes: 100 * MEGABYTE },
  'application/pdf': { messageType: 'document', maxSizeBytes: 100 * MEGABYTE },
  'application/msword': { messageType: 'document', maxSizeBytes: 100 * MEGABYTE },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    messageType: 'document',
    maxSizeBytes: 100 * MEGABYTE,
  },
  'application/vnd.ms-excel': { messageType: 'document', maxSizeBytes: 100 * MEGABYTE },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    messageType: 'document',
    maxSizeBytes: 100 * MEGABYTE,
  },
  'application/vnd.ms-powerpoint': { messageType: 'document', maxSizeBytes: 100 * MEGABYTE },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    messageType: 'document',
    maxSizeBytes: 100 * MEGABYTE,
  },
};
