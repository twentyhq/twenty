import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';
import { isSameFileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/utils/is-same-file-upload-principal.util';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';

export const canPrincipalCompleteFileUpload = ({
  file,
  principal,
}: {
  file: Pick<FileEntity, 'settings' | 'status'>;
  principal: FileUploadPrincipal;
}): boolean => {
  const uploadPrincipal = file.settings?.uploadPrincipal;

  if (!isDefined(uploadPrincipal)) {
    return file.status === FILE_STATUS.PENDING;
  }

  return isSameFileUploadPrincipal(uploadPrincipal, principal);
};
