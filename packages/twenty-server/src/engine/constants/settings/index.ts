import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    imageCropSizes: {
      'profile-picture': ['original'],
      'workspace-logo': ['original'],
      'person-picture': ['original'],
    },
    maxFileSize: '10MB',
    // Direct uploads (createFileUpload/completeFileUpload) stream to storage
    // without transiting the server memory, so they get a much higher cap
    // than multipart uploads.
    maxDirectUploadFileSize: '1GB',
  },
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
