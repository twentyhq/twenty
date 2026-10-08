import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateFindOneRecordQuery } from '@/object-record/utils/generateFindOneRecordQuery';

export const useFindOneRecordQuery = ({
  objectNameSingular,
  recordGqlFields,
  withSoftDeleted = false,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  withSoftDeleted?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const findOneRecordQuery = useMemo(
    () =>
      generateFindOneRecordQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        withSoftDeleted,
        objectPermissionsByObjectMetadataId,
      }),
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      withSoftDeleted,
      objectPermissionsByObjectMetadataId,
    ],
  );

  return {
    findOneRecordQuery,
  };
};
