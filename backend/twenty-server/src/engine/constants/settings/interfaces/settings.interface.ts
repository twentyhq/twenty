import { type FileFolder } from 'twenty-shared/types';

import { type ShortCropSize } from 'src/utils/image';

type ValueOfFileFolder = `${FileFolder}`;

export interface Settings {
  storage: {
    imageCropSizes: {
      [key in ValueOfFileFolder]?: ShortCropSize[];
    };
    maxFileSize: `${number}MB`;
  };
  minLengthOfStringForDuplicateCheck: number;
  maxVisibleViewFields: number;
}
