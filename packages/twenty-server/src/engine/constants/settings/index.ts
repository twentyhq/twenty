import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    maxMultipartFileSize: '5MB',
    // Direct uploads (createFileUpload/completeFileUpload) stream to storage
    // without transiting the server memory, so they get a much higher cap
    // than multipart uploads.
    maxDirectUploadFileSize: '1GB',
  },
  maxRequestBodySize: '100MB',
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
