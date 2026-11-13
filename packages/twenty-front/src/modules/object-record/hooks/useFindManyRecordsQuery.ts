import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
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
  relationAliases,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
  relationAliases?: RecordGqlRelationAlias[];
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
        relationAliases,
      }),
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      computeReferences,
      cursorDirection,
      objectPermissionsByObjectMetadataId,
      relationAliases,
    ],
  );

  return {
    findManyRecordsQuery,
  };
};
