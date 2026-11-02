import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type InboxObjectMetadata } from '@/sdk/inbox/mentions/types/inbox-object-metadata.type';

const OBJECTS_PAGE_SIZE = 1000;

export const findInboxObjectMetadataOrThrow = async ({
  metadataClient,
  objectNameSingular,
}: {
  metadataClient: MetadataApiClient;
  objectNameSingular: string;
}): Promise<InboxObjectMetadata> => {
  const { objects } = await metadataClient.query({
    objects: {
      __args: { filter: {}, paging: { first: OBJECTS_PAGE_SIZE } },
      edges: {
        node: {
          id: true,
          nameSingular: true,
          namePlural: true,
          labelIdentifierFieldMetadataId: true,
        },
      },
    },
  });

  const objectMetadata = objects.edges.find(
    ({ node }) => node.nameSingular === objectNameSingular,
  )?.node;

  if (!isDefined(objectMetadata)) {
    throw new Error(`This workspace has no ${objectNameSingular} object.`);
  }

  return objectMetadata;
};
