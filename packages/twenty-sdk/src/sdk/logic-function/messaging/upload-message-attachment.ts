import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { MESSAGE_ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER } from '@/sdk/logic-function/messaging/message-attachments-field-universal-identifier.constant';
import { type IngestMessageAttachment } from '@/sdk/logic-function/messaging/types/ingest-message.type';
import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

// Mirrors the label limit ingestMessages enforces, so a name it would refuse never reaches storage
const MESSAGE_ATTACHMENT_LABEL_MAX_LENGTH = 255;

// Needs UPLOAD_FILE on the app's role; a file no message ends up holding is kept, so upload only for messages without attachments
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
  if (
    !isNonEmptyString(filename) ||
    filename.length > MESSAGE_ATTACHMENT_LABEL_MAX_LENGTH
  ) {
    throw new Error(
      `uploadMessageAttachment() failed: filename must be 1 to ${MESSAGE_ATTACHMENT_LABEL_MAX_LENGTH} characters long`,
    );
  }

  const { apiUrl, accessToken } = getApplicationApiConfigOrThrow({
    caller: 'uploadMessageAttachment',
  });

  const client = new MetadataApiClient({
    url: `${apiUrl}/metadata`,
    headers: { Authorization: `Bearer ${accessToken}` },
    // uploadFile builds its own storage request, so the signal rides on fetch to reach it too
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, signal }),
  });

  const uploadedFile = await client.uploadFile({
    fileBuffer: Buffer.from(content),
    filename,
    fieldMetadataUniversalIdentifier:
      MESSAGE_ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  });

  return { fileId: uploadedFile.id, label: filename };
};
