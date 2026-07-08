import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { capitalize } from 'twenty-shared/utils';

import { type FileSource } from './types/file-source.type';
import { uploadFile } from './upload-file';
import { executeFilesGraphqlRequest } from './utils/execute-files-graphql-request';

const CREATE_ATTACHMENT_MUTATION = `
  mutation CreateOneAttachment($data: AttachmentCreateInput!) {
    createAttachment(data: $data) {
      id
      name
    }
  }
`;

export type AttachmentTarget = {
  objectNameSingular: string;
  recordId: string;
};

export type CreatedAttachment = {
  id: string;
  name: string;
};

export const createAttachment = async ({
  source,
  filename,
  target,
}: {
  source: FileSource;
  filename: string;
  target: AttachmentTarget;
}): Promise<CreatedAttachment> => {
  const uploadedFile = await uploadFile({
    source,
    filename,
    fieldMetadataUniversalIdentifier:
      STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
  });

  const { createAttachment: createdAttachment } =
    await executeFilesGraphqlRequest<{
      createAttachment: CreatedAttachment;
    }>({
      endpointPath: '/graphql',
      body: JSON.stringify({
        query: CREATE_ATTACHMENT_MUTATION,
        variables: {
          data: {
            name: filename,
            file: [{ fileId: uploadedFile.id, label: filename }],
            [`target${capitalize(target.objectNameSingular)}Id`]:
              target.recordId,
          },
        },
      }),
      caller: 'createAttachment',
    });

  return createdAttachment;
};
