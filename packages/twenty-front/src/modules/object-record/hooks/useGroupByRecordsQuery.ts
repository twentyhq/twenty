import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
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

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
