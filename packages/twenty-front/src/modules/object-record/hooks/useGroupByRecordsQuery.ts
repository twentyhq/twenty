import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateGroupByRecordsQuery } from '@/object-record/utils/generateGroupByRecordsQuery';

export const useGroupByRecordsQuery = ({
  objectNameSingular,
  recordGqlFields,
  computeReferences,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const groupByRecordsQuery = generateGroupByRecordsQuery({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    computeReferences,
    objectPermissionsByObjectMetadataId,
  });

  return {
    groupByRecordsQuery,
  };
};
