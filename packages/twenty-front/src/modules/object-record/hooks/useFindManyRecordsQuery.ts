import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getReadableRelationsWithArguments } from '@/object-record/graphql/utils/getReadableRelationsWithArguments';
import { getRelationsWithArgumentsVariables } from '@/object-record/graphql/utils/getRelationsWithArgumentsVariables';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import {
  type QueryCursorDirection,
  type RecordGqlFields,
} from 'twenty-shared/types';

export const useFindManyRecordsQuery = ({
  objectNameSingular,
  recordGqlFields,
  computeReferences,
  cursorDirection = 'after',
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const findManyRecordsQuery = useMemo(
    () =>
      generateFindManyRecordsQuery({
        objectMetadataItem,
        objectMetadataItems,
        recordGqlFields,
        computeReferences,
        cursorDirection,
        objectPermissionsByObjectMetadataId,
      }),
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      computeReferences,
      cursorDirection,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const relationsWithArgumentsVariables = useMemo(
    () =>
      getRelationsWithArgumentsVariables(
        getReadableRelationsWithArguments({
          objectMetadataItem,
          objectMetadataItems,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        }),
      ),
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    ],
  );

  return {
    findManyRecordsQuery,
    relationsWithArgumentsVariables,
  };
};
