import { gql } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { capitalize } from 'twenty-shared';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const useGenerateCombinedFindManyRecordsQuery = ({
  operationSignatures,
}: {
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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

  const lastCursorPerMetadataItemArray = operationSignatures
    .map(
      ({ objectNameSingular }) =>
        `$lastCursor${capitalize(objectNameSingular)}: String`,
    )
    .join(', ');

  const limitPerMetadataItemArray = operationSignatures
    .map(
      ({ objectNameSingular }) =>
        `$limit${capitalize(objectNameSingular)}: Int`,
    )
    .join(', ');

  const queryKeyWithObjectMetadataItemArray = operationSignatures.map(
    (queryKey) => {
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === queryKey.objectNameSingular,
      );

      if (isUndefined(objectMetadataItem)) {
        throw new Error(
          `Object metadata item not found for object name singular: ${queryKey.objectNameSingular}`,
        );
      }

      return { ...queryKey, objectMetadataItem };
    },
  );

  return gql`
    query CombinedFindManyRecords(
      ${filterPerMetadataItemArray}, 
      ${orderByPerMetadataItemArray}, 
      ${lastCursorPerMetadataItemArray}, 
      ${limitPerMetadataItemArray}
    ) {
      ${queryKeyWithObjectMetadataItemArray
        .map(
          ({ objectMetadataItem, fields }) =>
            `${objectMetadataItem.namePlural}(filter: $filter${capitalize(
              objectMetadataItem.nameSingular,
            )}, orderBy: $orderBy${capitalize(
              objectMetadataItem.nameSingular,
            )}, first: $limit${capitalize(
              objectMetadataItem.nameSingular,
            )}, after: $lastCursor${capitalize(
              objectMetadataItem.nameSingular,
            )}){
          edges {
            node ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems: objectMetadataItems,
              objectMetadataItem,
              recordGqlFields:
                fields ??
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
