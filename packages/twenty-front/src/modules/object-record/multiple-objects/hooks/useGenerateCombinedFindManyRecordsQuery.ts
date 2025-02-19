import { gql } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { getCombinedFindManyRecordsQueryFilteringPart } from '@/object-record/multiple-objects/utils/getCombinedFindManyRecordsQueryFilteringPart';
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
      const objectMetadataItem = objectMetadataItems.find(
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
              objectMetadataItems: objectMetadataItems,
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
