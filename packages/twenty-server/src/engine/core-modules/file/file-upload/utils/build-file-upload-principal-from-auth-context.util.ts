import { assertUnreachable } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';

export const buildFileUploadPrincipalFromAuthContext = (
  authContext: WorkspaceAuthContext,
): FileUploadPrincipal => {
  switch (authContext.type) {
    case 'user':
      return {
        applicationId: authContext.application?.id ?? null,
        userWorkspaceId: authContext.userWorkspaceId,
        apiKeyId: null,
      };
    case 'pendingActivationUser':
      return {
        applicationId: null,
        userWorkspaceId: authContext.userWorkspaceId,
        apiKeyId: null,
      };
    case 'apiKey':
      return {
        applicationId: null,
        userWorkspaceId: null,
        apiKeyId: authContext.apiKey.id,
      };
    case 'application':
      return {
        applicationId: authContext.application.id,
        userWorkspaceId: null,
        apiKeyId: null,
      };
    case 'system':
      return {
        applicationId: null,
        userWorkspaceId: null,
        apiKeyId: null,
      };
    default:
      return assertUnreachable(authContext);
  }
};
