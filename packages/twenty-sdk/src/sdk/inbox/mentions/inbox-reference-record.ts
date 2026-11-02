import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { formatRecordReference } from 'twenty-shared/ai';

import { computeInboxRecordLabel } from '@/sdk/inbox/mentions/utils/compute-inbox-record-label.util';
import { findInboxLabelIdentifierField } from '@/sdk/inbox/mentions/utils/find-inbox-label-identifier-field.util';
import { findInboxObjectMetadataOrThrow } from '@/sdk/inbox/mentions/utils/find-inbox-object-metadata-or-throw.util';
import { sanitizeInboxReferenceLabel } from '@/sdk/inbox/mentions/utils/sanitize-inbox-reference-label.util';

export const inboxReferenceRecord = async ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}): Promise<string> => {
  const metadataClient = new MetadataApiClient();
  const objectMetadata = await findInboxObjectMetadataOrThrow({
    metadataClient,
    objectNameSingular,
  });

  const [labelIdentifierField, recordResponse] = await Promise.all([
    findInboxLabelIdentifierField({ metadataClient, objectMetadata }),
    new RestApiClient().get<{
      data: Record<string, Record<string, unknown>>;
    }>(`/rest/${objectMetadata.namePlural}/${recordId}`),
  ]);

  return formatRecordReference({
    objectNameSingular,
    recordId,
    displayName: sanitizeInboxReferenceLabel(
      computeInboxRecordLabel({
        record: recordResponse.data[objectNameSingular],
        recordId,
        labelIdentifierField,
      }),
    ),
  });
};
