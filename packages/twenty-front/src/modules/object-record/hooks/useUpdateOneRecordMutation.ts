import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
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

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { updateOneRecordMutation: EMPTY_MUTATION };
  }

  const updateOneRecordMutation = generateUpdateOneRecordMutation({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    computeReferences,
    objectPermissionsByObjectMetadataId,
  });

  return {
    updateOneRecordMutation,
  };
};
