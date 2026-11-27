import { CORE_PICTURE_MAX_FILE_SIZE_IN_MB } from 'twenty-shared/constants';

import { MAX_REQUEST_BODY_SIZE } from 'src/engine/constants/max-request-body-size.constant';

import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    maxMultipartFileSize: '5MB',
    // Direct uploads stream to storage without transiting server memory
    maxDirectUploadFileSize: '1GB',
    maxCorePictureFileSize: `${CORE_PICTURE_MAX_FILE_SIZE_IN_MB}MB`,
  },
  maxRequestBodySize: MAX_REQUEST_BODY_SIZE,
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
