import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    imageCropSizes: {
      'profile-picture': ['original'],
      'workspace-logo': ['original'],
      'person-picture': ['original'],
    },
    maxFileSize: '10MB',
  },
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
