import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    maxMultipartFileSize: '5MB',
    // Direct uploads stream to storage without transiting server memory
    maxDirectUploadFileSize: '1GB',
    maxCorePictureFileSize: '10MB',
  },
  maxRequestBodySize: '100MB',
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
