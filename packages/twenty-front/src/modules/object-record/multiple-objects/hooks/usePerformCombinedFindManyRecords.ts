import { type ApolloClient, gql } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedFindManyRecordsQueryVariables } from '@/object-record/multiple-objects/utils/generateCombinedFindManyRecordsQueryVariables';
import { getCombinedFindManyRecordsQueryFilteringPart } from '@/object-record/multiple-objects/utils/getCombinedFindManyRecordsQueryFilteringPart';
import { capitalize } from 'twenty-shared/utils';

export const usePerformCombinedFindManyRecords = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const generateCombinedFindManyRecordsQuery = (
    operationSignatures: RecordGqlOperationSignature[],
    objectMetadataItemsValue: ObjectMetadataItem[],
  ) => {
    const filterPerMetadataItemArray = operationSignatures
      .map(
        ({ objectNameSingular }) =>
          `$filter${capitalize(objectNameSingular)}: ${capitalize(
            objectNameSingular,
          )}FilterInput`,
      )
      .join(', ');

    const orderByPerMetadataItemArray = operationSignatures
      .map(
        ({ objectNameSingular }) =>
          `$orderBy${capitalize(objectNameSingular)}: [${capitalize(
            objectNameSingular,
          )}OrderByInput]`,
      )
      .join(', ');

    const cursorFilteringPerMetadataItemArray = operationSignatures
      .map(
        ({ objectNameSingular }) =>
          `$after${capitalize(objectNameSingular)}: String, $before${capitalize(objectNameSingular)}: String, $first${capitalize(objectNameSingular)}: Int, $last${capitalize(objectNameSingular)}: Int`,
      )
      .join(', ');

    const queryOperationSignatureWithObjectMetadataItemArray =
      operationSignatures.map((operationSignature) => {
        const objectMetadataItem = objectMetadataItemsValue.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular ===
            operationSignature.objectNameSingular,
        );

        if (isUndefined(objectMetadataItem)) {
          throw new Error(
            `Object metadata item not found for object name singular: ${operationSignature.objectNameSingular}`,
          );
        }

        return { operationSignature, objectMetadataItem };
      });

    return gql`
    query CombinedFindManyRecords(
      ${filterPerMetadataItemArray}, 
      ${orderByPerMetadataItemArray}, 
      ${cursorFilteringPerMetadataItemArray}, 
    ) {
      ${queryOperationSignatureWithObjectMetadataItemArray
        .map(
          ({ objectMetadataItem, operationSignature }) =>
            `${getCombinedFindManyRecordsQueryFilteringPart(
              objectMetadataItem,
            )} {
          edges {
            node ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems: objectMetadataItemsValue,
              objectMetadataItem,
              recordGqlFields:
                operationSignature.fields ??
                generateDepthRecordGqlFieldsFromObject({
                  objectMetadataItem,
                  objectMetadataItems,
                  depth: 1,
                }),
              objectPermissionsByObjectMetadataId,
            })}
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }`,
        )
        .join('\n')}
    }
  `;
  };

  const performCombinedFindManyRecords = async ({
    operationSignatures,
    client: customClient,
  }: {
    operationSignatures: RecordGqlOperationSignature[];
    client?: ApolloClient<object>;
  }) => {
    const apolloClient = customClient || apolloCoreClient;

    const findManyQuery = generateCombinedFindManyRecordsQuery(
      operationSignatures,
      objectMetadataItems,
    );

    const queryVariables = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    const { data, loading } =
      await apolloClient.query<CombinedFindManyRecordsQueryResult>({
        query: findManyQuery ?? EMPTY_QUERY,
        variables: queryVariables,
      });

    const resultWithoutConnection = Object.fromEntries(
      Object.entries(data ?? {}).map(([namePlural, objectRecordConnection]) => [
        namePlural,
        getRecordsFromRecordConnection({
          recordConnection: objectRecordConnection,
        }),
      ]),
    );

    return {
      result: resultWithoutConnection,
      loading,
    };
  };

  return { performCombinedFindManyRecords };
};
