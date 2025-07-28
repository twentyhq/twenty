import { ApolloClient, gql } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedFindManyRecordsQueryVariables } from '@/object-record/multiple-objects/utils/generateCombinedFindManyRecordsQueryVariables';
import { getCombinedFindManyRecordsQueryFilteringPart } from '@/object-record/multiple-objects/utils/getCombinedFindManyRecordsQueryFilteringPart';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const usePerformCombinedFindManyRecords = () => {
  const apolloCoreClient = useApolloCoreClient();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const featureFlags = useFeatureFlagsMap();
  const isFieldsPermissionsEnabled =
    featureFlags[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED];

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

    const limitPerMetadataItemArray = operationSignatures
      .map(
        ({ objectNameSingular }) =>
          `$limit${capitalize(objectNameSingular)}: Int`,
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
      ${limitPerMetadataItemArray}
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
                generateDepthOneRecordGqlFields({
                  objectMetadataItem,
                }),
              objectPermissionsByObjectMetadataId,
              isFieldsPermissionsEnabled,
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
