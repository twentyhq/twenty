import { type ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { capitalize, isDefined } from 'twenty-shared/utils';

const RESOLVE_BATCH_SIZE = 200;

export const resolveRelationIdsFromExistingRecords = async ({
  apolloClient,
  parentObjectMetadataItem,
  parentRecordIds,
  relationFieldName,
}: {
  apolloClient: ApolloClient;
  parentObjectMetadataItem: EnrichedObjectMetadataItem;
  parentRecordIds: string[];
  relationFieldName: string;
}): Promise<Map<string, string>> => {
  const foreignKeyFieldName = `${relationFieldName}Id`;

  const query = gql`
    query Resolve${capitalize(parentObjectMetadataItem.namePlural)}RelationIds(
      $filter: ${capitalize(parentObjectMetadataItem.nameSingular)}FilterInput
    ) {
      ${parentObjectMetadataItem.namePlural}(filter: $filter) {
        edges {
          node {
            id
            ${foreignKeyFieldName}
          }
        }
      }
    }
  `;

  const parentToRelationId = new Map<string, string>();

  for (let i = 0; i < parentRecordIds.length; i += RESOLVE_BATCH_SIZE) {
    const batch = parentRecordIds.slice(i, i + RESOLVE_BATCH_SIZE);

    const { data } = await apolloClient.query({
      query,
      variables: {
        filter: {
          id: { in: batch },
        },
      },
      fetchPolicy: 'network-only',
    });

    const queryData = data as Record<string, any>;
    const edges =
      queryData?.[parentObjectMetadataItem.namePlural]?.edges ?? [];
    for (const edge of edges) {
      const parentId = edge.node?.id;
      const relationId = edge.node?.[foreignKeyFieldName];
      if (isDefined(parentId) && isDefined(relationId)) {
        parentToRelationId.set(parentId as string, relationId as string);
      }
    }
  }

  return parentToRelationId;
};
