const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
  json: 'application/json',
  txt: 'text/plain',
};

export const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();

  return MIME_TYPES[ext ?? ''] ?? 'application/octet-stream';
};
