import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

export type FileUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

// Mints a short-lived upload slot for a new file - the returned uploadUrl is either a presigned
// S3 URL or (local storage fallback) a same-server URL carrying its own auth token in the query
// string, so the actual byte PUT against it needs no Authorization header of its own.
// `fileFolder: 'FilesField'` and a real `fieldMetadataId` are required for uploads targeting a
// FILES-type field (e.g. attachment.file) - other FileFolder values reject direct upload.
export const createFileUpload = async (
  client: AxiosInstance,
  filename: string,
  size: number,
  fieldMetadataId: string,
): Promise<FileUploadTarget> => {
  const mutation = `mutation createFileUpload($filename: String!, $size: Float!, $fileFolder: FileFolder!, $fieldMetadataId: String) {
  createFileUpload(filename: $filename, size: $size, fileFolder: $fileFolder, fieldMetadataId: $fieldMetadataId) {
    fileId
    uploadUrl
    contentType
    expiresAt
  }
}`;

  const data = await postGraphql<{ createFileUpload: FileUploadTarget }>(
    client,
    '/graphql',
    'createFileUpload',
    mutation,
    { filename, size, fileFolder: 'FilesField', fieldMetadataId },
  );

  return data.createFileUpload;
}
