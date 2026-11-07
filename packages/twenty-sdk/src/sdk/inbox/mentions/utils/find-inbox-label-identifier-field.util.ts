import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type InboxLabelIdentifierField } from '@/sdk/inbox/mentions/types/inbox-label-identifier-field.type';
import { type InboxObjectMetadata } from '@/sdk/inbox/mentions/types/inbox-object-metadata.type';

export const findInboxLabelIdentifierField = async ({
  metadataClient,
  objectMetadata,
}: {
  metadataClient: MetadataApiClient;
  objectMetadata: Pick<
    InboxObjectMetadata,
    'id' | 'labelIdentifierFieldMetadataId'
  >;
}): Promise<InboxLabelIdentifierField | undefined> => {
  if (!isDefined(objectMetadata.labelIdentifierFieldMetadataId)) {
    return undefined;
  }

  const { object } = await metadataClient.query({
    object: {
      __args: { id: objectMetadata.id },
      fields: {
        __args: {
          filter: { id: { eq: objectMetadata.labelIdentifierFieldMetadataId } },
          paging: { first: 1 },
        },
        edges: { node: { name: true, type: true } },
      },
    },
  });

  return object.fields.edges[0]?.node;
};
