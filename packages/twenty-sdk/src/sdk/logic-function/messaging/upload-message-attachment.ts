import { MESSAGE_ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER } from '@/sdk/logic-function/messaging/message-attachments-field-universal-identifier.constant';
import { type IngestMessageAttachment } from '@/sdk/logic-function/messaging/types/ingest-message.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const CREATE_MESSAGE_ATTACHMENT_UPLOAD_MUTATION = `
  mutation CreateMessageAttachmentUpload($filename: String!, $size: Float!, $fieldMetadataUniversalIdentifier: String!) {
    createFileUpload(filename: $filename, size: $size, fileFolder: FilesField, fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier) {
      fileId
      uploadUrl
      contentType
    }
  }
`;

const COMPLETE_MESSAGE_ATTACHMENT_UPLOAD_MUTATION = `
  mutation CompleteMessageAttachmentUpload($fileId: String!) {
    completeFileUpload(fileId: $fileId) {
      id
    }
  }
`;

// Requires the UPLOAD_FILE permission flag on the app's role. Upload only for messages
// ingestMessages reports without attachments: a file it does not attach is kept anyway
export const uploadMessageAttachment = async ({
  filename,
  content,
  signal,
}: {
  // Its extension decides how Twenty renders the file
  filename: string;
  content: Uint8Array;
  signal?: AbortSignal;
}): Promise<IngestMessageAttachment> => {
  const { createFileUpload: uploadTarget } = await postGraphqlRequest<
    {
      filename: string;
      size: number;
      fieldMetadataUniversalIdentifier: string;
    },
    {
      createFileUpload: {
        fileId: string;
        uploadUrl: string;
        contentType: string;
      };
    }
  >({
    query: CREATE_MESSAGE_ATTACHMENT_UPLOAD_MUTATION,
    variables: {
      filename,
      size: content.byteLength,
      fieldMetadataUniversalIdentifier:
        MESSAGE_ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER,
    },
    caller: 'uploadMessageAttachment',
    signal,
  });

  const uploadResponse = await fetch(uploadTarget.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': uploadTarget.contentType },
    body: new Blob([content as Uint8Array<ArrayBuffer>], {
      type: uploadTarget.contentType,
    }),
    signal,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `uploadMessageAttachment() failed: upload answered HTTP ${uploadResponse.status} ${uploadResponse.statusText}`,
    );
  }

  const { completeFileUpload } = await postGraphqlRequest<
    { fileId: string },
    { completeFileUpload: { id: string } }
  >({
    query: COMPLETE_MESSAGE_ATTACHMENT_UPLOAD_MUTATION,
    variables: { fileId: uploadTarget.fileId },
    caller: 'uploadMessageAttachment',
    signal,
  });

  return { fileId: completeFileUpload.id, label: filename };
};
