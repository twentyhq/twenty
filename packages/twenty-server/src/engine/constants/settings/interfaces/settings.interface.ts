import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { ShortCropSize } from 'src/utils/image';

type ValueOfFileFolder = `${FileFolder}`;

export interface Settings {
  storage: {
    imageCropSizes: {
      [key in ValueOfFileFolder]?: ShortCropSize[];
    };
    maxFileSize: `${number}MB`;
  };
  minLengthOfStringForDuplicateCheck: number;
}
