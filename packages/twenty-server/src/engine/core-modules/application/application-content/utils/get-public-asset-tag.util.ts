const IMAGE_FILE_EXTENSIONS = new Set([
  'avif',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
]);

export const getPublicAssetTag = (fileType: string): 'IMAGE' | 'FILE' =>
  IMAGE_FILE_EXTENSIONS.has(fileType.toLowerCase()) ? 'IMAGE' : 'FILE';
