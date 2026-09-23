import {
  type FileUploadTarget,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

export const uploadFileThroughUploadTarget = async ({
  file,
  createFileUpload,
  completeFileUpload,
  signal,
}: {
  file: File;
  createFileUpload: () => Promise<
    Pick<FileUploadTarget, 'fileId' | 'uploadUrl' | 'contentType'>
  >;
  completeFileUpload: (fileId: string) => Promise<FileWithSignedUrl>;
  signal?: AbortSignal;
}): Promise<FileWithSignedUrl> => {
  const uploadTarget = await createFileUpload();

  const putResponse = await fetch(uploadTarget.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': uploadTarget.contentType },
    body: file,
    credentials: 'omit',
    signal,
  });

  if (!putResponse.ok) {
    throw new Error(`File upload failed with status ${putResponse.status}`);
  }

  return completeFileUpload(uploadTarget.fileId);
};
