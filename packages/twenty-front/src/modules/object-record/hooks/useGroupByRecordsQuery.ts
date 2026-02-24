import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
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

  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

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
