import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { capitalize } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useUpdateOneRecordMutation = ({
  objectNameSingular,
  recordGqlFields,
  computeReferences = false,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const featureFlags = useFeatureFlagsMap();
  const isFieldsPermissionsEnabled =
    featureFlags[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED];

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { updateOneRecordMutation: EMPTY_MUTATION };
  }

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthOneRecordGqlFields({
      objectMetadataItem,
    });

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getUpdateOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  const updateOneRecordMutation = gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: UUID!, $input: ${capitalizedObjectName}UpdateInput!)  {
      ${mutationResponseField}(id: $idToUpdate, data: $input) ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          computeReferences,
          recordGqlFields: appliedRecordGqlFields,
          objectPermissionsByObjectMetadataId,
          isFieldsPermissionsEnabled,
        },
      )}
    }
  `;

  return {
    updateOneRecordMutation,
  };
};
