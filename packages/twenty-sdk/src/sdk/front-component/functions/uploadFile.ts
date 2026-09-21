import { isDefined } from 'twenty-shared/utils';

import {
  type UploadFileFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const uploadFile: UploadFileFunction = (file, params) => {
  const uploadFileFunction = frontComponentHostCommunicationApi.uploadFile;

  if (!isDefined(uploadFileFunction)) {
    throw new Error('uploadFileFunction is not set');
  }

  return uploadFileFunction(file, params);
};
