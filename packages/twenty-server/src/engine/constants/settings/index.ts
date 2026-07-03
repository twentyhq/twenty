import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    maxFileSize: '10MB',
  },
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
