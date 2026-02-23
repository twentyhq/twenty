import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { generateCreateOneRecordMutation } from '@/object-metadata/utils/generateCreateOneRecordMutation';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateOneRecordMutation = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { createOneRecordMutation: EMPTY_MUTATION };
  }

  const createOneRecordMutation = generateCreateOneRecordMutation({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId,
  });

  return {
    createOneRecordMutation,
  };
};
