import { type ASTNode, print } from 'graphql';
import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

type FileUploadOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

type FileAttachment = {
  field: string;
  buffer: Buffer;
  filename: string;
  contentType: string;
};

export const makeMetadataAPIRequestWithFileUpload = (
  graphqlOperation: FileUploadOperation,
  fileAttachment: FileAttachment,
  token: string | undefined = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  const clientInstance = client.post('/metadata');

  if (isDefined(token)) {
    clientInstance.set('Authorization', `Bearer ${token}`);
  }

  return clientInstance
    .field(
      'operations',
      JSON.stringify({
        query: print(graphqlOperation.query),
        variables: graphqlOperation.variables || {},
      }),
    )
    .field(
      'map',
      JSON.stringify({ '0': [`variables.${fileAttachment.field}`] }),
    )
    .attach('0', fileAttachment.buffer, {
      filename: fileAttachment.filename,
      contentType: fileAttachment.contentType,
    });
};
