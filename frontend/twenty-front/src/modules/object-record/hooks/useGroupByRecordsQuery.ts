import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const groupByRecordsQuery = useMemo(
    () =>
      generateGroupByRecordsQuery({
        objectMetadataItem,
        objectMetadataItems,
        recordGqlFields,
        computeReferences,
        objectPermissionsByObjectMetadataId,
      }),
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      computeReferences,
      objectPermissionsByObjectMetadataId,
    ],
  );

  return {
    groupByRecordsQuery,
  };
};
