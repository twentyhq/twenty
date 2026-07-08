import { type FileSource } from './types/file-source.type';
import { type UploadedFile } from './types/uploaded-file.type';
import { executeFilesGraphqlRequest } from './utils/execute-files-graphql-request';

const UPLOAD_FILES_FIELD_FILE_MUTATION = `
  mutation UploadFilesFieldFileByUniversalIdentifier($file: Upload!, $fieldMetadataUniversalIdentifier: String!) {
    uploadFilesFieldFileByUniversalIdentifier(file: $file, fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier) {
      id
      path
      size
      createdAt
      url
    }
  }
`;

const resolveFileSourceBlob = async (source: FileSource): Promise<Blob> => {
  if ('url' in source) {
    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error(
        `uploadFile() failed to download ${source.url}: HTTP ${response.status} ${response.statusText}`,
      );
    }

    return await response.blob();
  }

  if (source.data instanceof Blob) {
    return source.data;
  }

  return new Blob([source.data as BlobPart], {
    type: source.contentType ?? 'application/octet-stream',
  });
};

export const uploadFile = async ({
  source,
  filename,
  fieldMetadataUniversalIdentifier,
}: {
  source: FileSource;
  filename: string;
  fieldMetadataUniversalIdentifier: string;
}): Promise<UploadedFile> => {
  const fileBlob = await resolveFileSourceBlob(source);

  const form = new FormData();

  form.append(
    'operations',
    JSON.stringify({
      query: UPLOAD_FILES_FIELD_FILE_MUTATION,
      variables: { file: null, fieldMetadataUniversalIdentifier },
    }),
  );
  form.append('map', JSON.stringify({ '0': ['variables.file'] }));
  form.append('0', fileBlob, filename);

  const { uploadFilesFieldFileByUniversalIdentifier } =
    await executeFilesGraphqlRequest<{
      uploadFilesFieldFileByUniversalIdentifier: UploadedFile;
    }>({
      endpointPath: '/metadata',
      body: form,
      caller: 'uploadFile',
    });

  return uploadFilesFieldFileByUniversalIdentifier;
};
