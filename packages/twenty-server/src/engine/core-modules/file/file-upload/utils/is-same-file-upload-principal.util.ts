import { isDefined } from 'twenty-shared/utils';

import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';

export const isSameFileUploadPrincipal = (
  initiator: FileUploadPrincipal,
  caller: FileUploadPrincipal,
): boolean => {
  if (isDefined(initiator.applicationId) || isDefined(caller.applicationId)) {
    return initiator.applicationId === caller.applicationId;
  }

  return (
    initiator.userWorkspaceId === caller.userWorkspaceId &&
    initiator.apiKeyId === caller.apiKeyId
  );
};
