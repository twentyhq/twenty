import { MetadataApiClient } from '@/clients';
import { defineLogicFunction } from '@/sdk';

export const LIST_OBJECTS_UNIVERSAL_IDENTIFIER =
  'c4d8f3a2-5e91-4b23-b7f4-0d9c2e1a6f8b';

const listObjectsHandler = async () => {
  const metadataClient = new MetadataApiClient();

  const result = await metadataClient.query({
    objects: {
      __args: { paging: { first: 3 } },
      edges: { node: { nameSingular: true } },
    },
  });

  return { objects: result.objects };
};

export default defineLogicFunction({
  universalIdentifier: LIST_OBJECTS_UNIVERSAL_IDENTIFIER,
  name: 'list-objects',
  timeoutSeconds: 10,
  handler: listObjectsHandler,
});
