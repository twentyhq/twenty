import { ApolloClient, gql, useApolloClient } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';
import { capitalize, isDefined } from 'twenty-shared';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { getCombinedFindManyRecordsQueryFilteringPart } from '@/object-record/multiple-objects/utils/getCombinedFindManyRecordsQueryFilteringPart';
import { useRecoilValue } from 'recoil';

export const usePerformCombinedFindManyRecords = () => {
  const client = useApolloClient();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const generateCombinedFindManyRecordsQuery = (
    operationSignatures: RecordGqlOperationSignature[],
    objectMetadataItemsValue: ObjectMetadataItem[],
  ) => {
    if (!isNonEmptyArray(operationSignatures)) {
      return null;
    }

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

  const generateCombinedFindManyRecordsQueryVariables = (
    operationSignatures: RecordGqlOperationSignature[],
  ) => {
    if (!isNonEmptyArray(operationSignatures)) {
      return {};
    }

    return operationSignatures.reduce(
      (acc, { objectNameSingular, variables }) => {
        const capitalizedName = capitalize(objectNameSingular);

        const filter = isDefined(variables?.filter)
          ? { [`filter${capitalizedName}`]: variables.filter }
          : {};

        const orderBy = isDefined(variables?.orderBy)
          ? { [`orderBy${capitalizedName}`]: variables.orderBy }
          : {};

        let limit = {};

        const hasLimit = isDefined(variables?.limit) && variables.limit > 0;

        const cursorDirection = variables?.cursorFilter?.cursorDirection;

        let cursorFilter = {};

        if (isDefined(variables?.cursorFilter?.cursor)) {
          if (cursorDirection === 'after') {
            cursorFilter = {
              [`after${capitalizedName}`]: variables.cursorFilter?.cursor,
            };

            if (hasLimit) {
              cursorFilter = {
                ...cursorFilter,
                [`first${capitalizedName}`]: variables.limit,
              };
            }
          } else if (cursorDirection === 'before') {
            cursorFilter = {
              [`before${capitalizedName}`]: variables.cursorFilter?.cursor,
            };

            if (hasLimit) {
              cursorFilter = {
                ...cursorFilter,
                [`last${capitalizedName}`]: variables.limit,
              };
            }
          }
        } else if (hasLimit) {
          limit = {
            [`limit${capitalizedName}`]: variables.limit,
          };
        }

        return {
          ...acc,
          ...filter,
          ...orderBy,
          ...limit,
          ...cursorFilter,
        };
      },
      {},
    );
  };

  const performCombinedFindManyRecords = async ({
    operationSignatures,
    client: customClient,
  }: {
    operationSignatures: RecordGqlOperationSignature[];
    client?: ApolloClient<object>;
  }) => {
    const apolloClient = customClient || client;

    const findManyQuery = generateCombinedFindManyRecordsQuery(
      operationSignatures,
      objectMetadataItems,
    );

    const queryVariables =
      generateCombinedFindManyRecordsQueryVariables(operationSignatures);

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
