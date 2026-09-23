import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';

export const isSameFileUploadPrincipal = (
  first: FileUploadPrincipal,
  second: FileUploadPrincipal,
): boolean =>
  (first.applicationId ?? null) === (second.applicationId ?? null) &&
  (first.userWorkspaceId ?? null) === (second.userWorkspaceId ?? null) &&
  (first.apiKeyId ?? null) === (second.apiKeyId ?? null);
