import { isUndefined } from '@sniptt/guards';
import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

import { SLACK_ASSISTANT_ATTACHMENT_UPLOAD_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-attachment-upload-timeout-ms';

const AGENT_CHAT_FILE_FOLDER = 'AgentChat';

export const uploadFileToAgentChat = async ({
  metadataClient,
  fileName,
  bytes,
}: {
  metadataClient: InstanceType<typeof MetadataApiClient>;
  fileName: string;
  bytes: Uint8Array<ArrayBuffer>;
}): Promise<string> => {
  const createResult = await metadataClient.mutation({
    createFileUpload: {
      __args: {
        filename: fileName,
        size: bytes.byteLength,
        fileFolder: AGENT_CHAT_FILE_FOLDER,
      },
      fileId: true,
      uploadUrl: true,
      contentType: true,
    },
  });
  const uploadTarget = createResult.createFileUpload;

  if (isUndefined(uploadTarget)) {
    throw new Error('createFileUpload did not return an upload target');
  }

  const uploadResponse = await fetch(uploadTarget.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': uploadTarget.contentType },
    body: new Blob([bytes], { type: uploadTarget.contentType }),
    signal: AbortSignal.timeout(SLACK_ASSISTANT_ATTACHMENT_UPLOAD_TIMEOUT_MS),
  });

  if (!uploadResponse.ok) {
    throw new Error(`upload failed with status ${uploadResponse.status}`);
  }

  const completeResult = await metadataClient.mutation({
    completeFileUpload: {
      __args: { fileId: uploadTarget.fileId },
      id: true,
    },
  });
  const uploadedFileId = completeResult.completeFileUpload?.id;

  if (isUndefined(uploadedFileId)) {
    throw new Error('completeFileUpload did not return a file id');
  }

  return uploadedFileId;
};
