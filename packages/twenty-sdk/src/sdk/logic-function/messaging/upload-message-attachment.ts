import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from '@/sdk/logic-function/messaging/attachment-file-field-universal-identifier.constant';
import { type IngestMessageAttachment } from '@/sdk/logic-function/messaging/types/ingest-message.type';
import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

const MESSAGE_ATTACHMENT_LABEL_MAX_LENGTH = 255;

export const uploadMessageAttachment = async ({
  filename,
  content,
  signal,
}: {
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
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, signal }),
  });

  const uploadedFile = await client.uploadFile({
    fileBuffer: content,
    filename,
    fieldMetadataUniversalIdentifier:
      ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  });

  return { fileId: uploadedFile.id, label: filename };
};
