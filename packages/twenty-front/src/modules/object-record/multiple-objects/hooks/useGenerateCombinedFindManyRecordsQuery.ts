import { gql } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getCombinedFindManyRecordsQueryFilteringPart } from '@/object-record/multiple-objects/utils/getCombinedFindManyRecordsQueryFilteringPart';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import isEmpty from 'lodash.isempty';
import { capitalize } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const useGenerateCombinedFindManyRecordsQuery = ({
  operationSignatures,
}: {
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const featureFlags = useFeatureFlagsMap();
  const isFieldsPermissionsEnabled =
    featureFlags[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED];

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

  const limitPerMetadataItemArray =
    queryOperationSignatureWithObjectMetadataItemArray
      .map(
        ({ objectMetadataItem }) =>
          `$limit${capitalize(objectMetadataItem.nameSingular)}: Int`,
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
