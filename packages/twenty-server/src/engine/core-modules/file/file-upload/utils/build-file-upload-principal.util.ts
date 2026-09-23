import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';

export const buildFileUploadPrincipal = ({
  application,
  userWorkspaceId,
  apiKey,
}: {
  application: { id: string } | undefined;
  userWorkspaceId: string | undefined;
  apiKey: { id: string } | undefined;
}): FileUploadPrincipal => ({
  applicationId: application?.id ?? null,
  userWorkspaceId: userWorkspaceId ?? null,
  apiKeyId: apiKey?.id ?? null,
});
