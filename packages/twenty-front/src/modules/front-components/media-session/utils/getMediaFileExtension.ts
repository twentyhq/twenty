const MIME_TYPE_TO_FILE_EXTENSION: Record<string, string> = {
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/mp4': 'm4a',
  'video/mp4': 'mp4',
  'audio/ogg': 'ogg',
  'video/ogg': 'ogg',
  'audio/opus': 'ogg',
};

export const getMediaFileExtension = (mimeType: string): string => {
  const baseMimeType = mimeType.split(';')[0].trim().toLowerCase();

  return MIME_TYPE_TO_FILE_EXTENSION[baseMimeType] ?? 'webm';
};
