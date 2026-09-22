import { t } from '@lingui/core/macro';
import { type FileUploadTarget } from '~/generated-metadata/graphql';

type PutFileToUploadTargetArgs = {
  file: File;
  uploadTarget: Pick<FileUploadTarget, 'uploadUrl' | 'contentType'>;
  signal?: AbortSignal;
};

export const putFileToUploadTarget = async ({
  file,
  uploadTarget,
  signal,
}: PutFileToUploadTargetArgs): Promise<void> => {
  const putResponse = await fetch(uploadTarget.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': uploadTarget.contentType },
    body: file,
    credentials: 'omit',
    signal,
  });

  if (!putResponse.ok) {
    throw new Error(t`File upload failed (${putResponse.status}).`);
  }
};
