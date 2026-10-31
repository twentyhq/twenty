import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { LIST_RECORDS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type ListRecordsInput = { objectUniversalIdentifier?: string };

// Metadata agnostic: the app cannot know the workspace's objects, so it resolves them at runtime
const handler = async ({ body }: RoutePayload<ListRecordsInput>) => {
  const objectUniversalIdentifier = body?.objectUniversalIdentifier;
  const client = new RestApiClient();

  const { objects } = await new MetadataApiClient().query({
    objects: {
      __args: { filter: {}, paging: { first: 1000 } },
      edges: { node: { universalIdentifier: true, namePlural: true } },
    },
  });

  const objectMetadata = objects.edges
    .map((edge) => edge.node)
    .find(
      (object) =>
        object.universalIdentifier === objectUniversalIdentifier,
    );

  if (!objectMetadata) {
    return { error: `Unknown object ${objectUniversalIdentifier}` };
  }

  try {
    const response = await client.get<{
      data: Record<string, unknown[]>;
    }>(`/rest/${objectMetadata.namePlural}`, { query: { limit: 3 } });

    return {
      object: objectMetadata.namePlural,
      records: response.data[objectMetadata.namePlural],
    };
  } catch (error) {
    return {
      object: objectMetadata.namePlural,
      error:
        error instanceof RestApiClientError
          ? JSON.stringify(error.body)
          : error instanceof Error
            ? error.message
            : String(error),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: LIST_RECORDS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'list-records',
  description:
    'Lists a few records of the object whose universal identifier is given',
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/list-records',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
