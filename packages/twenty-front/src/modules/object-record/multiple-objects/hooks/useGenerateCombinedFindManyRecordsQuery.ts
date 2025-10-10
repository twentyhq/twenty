import { gql } from '@apollo/client';
import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getCombinedFindManyRecordsQueryFilteringPart } from '@/object-record/multiple-objects/utils/getCombinedFindManyRecordsQueryFilteringPart';
import isEmpty from 'lodash.isempty';
import { capitalize } from 'twenty-shared/utils';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';

export const useGenerateCombinedFindManyRecordsQuery = ({
  operationSignatures,
}: {
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  if (!isNonEmptyArray(operationSignatures)) {
    return null;
  }

  const queryOperationSignatureWithObjectMetadataItemArray = operationSignatures
    .map((operationSignature) => {
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
    })
    .filter(
      ({ objectMetadataItem }) =>
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        )?.canReadObjectRecords,
    );

  const filterPerMetadataItemArray =
    queryOperationSignatureWithObjectMetadataItemArray
      .map(
        ({ objectMetadataItem }) =>
          `$filter${capitalize(objectMetadataItem.nameSingular)}: ${capitalize(
            objectMetadataItem.nameSingular,
          )}FilterInput`,
      )
      .join(', ');

  const orderByPerMetadataItemArray =
    queryOperationSignatureWithObjectMetadataItemArray
      .map(
        ({ objectMetadataItem }) =>
          `$orderBy${capitalize(objectMetadataItem.nameSingular)}: [${capitalize(
            objectMetadataItem.nameSingular,
          )}OrderByInput]`,
      )
      .join(', ');

  const cursorFilteringPerMetadataItemArray =
    queryOperationSignatureWithObjectMetadataItemArray
      .map(
        ({ objectMetadataItem }) =>
          `$after${capitalize(objectMetadataItem.nameSingular)}: String, $before${capitalize(objectMetadataItem.nameSingular)}: String, $first${capitalize(objectMetadataItem.nameSingular)}: Int, $last${capitalize(objectMetadataItem.nameSingular)}: Int`,
      )
      .join(', ');

  if (isEmpty(queryOperationSignatureWithObjectMetadataItemArray)) {
    return null;
  }

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
              objectMetadataItems: objectMetadataItems,
              objectMetadataItem,
              recordGqlFields:
                operationSignature.fields ??
                generateDepthRecordGqlFieldsFromObject({
                  objectMetadataItems,
                  depth: 1,
                  objectMetadataItem,
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
