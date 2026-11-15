import { useMemo } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getReadableRelationsWithArguments } from '@/object-record/graphql/utils/getReadableRelationsWithArguments';
import { getRelationsWithArgumentsVariables } from '@/object-record/graphql/utils/getRelationsWithArgumentsVariables';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RecordGqlFields } from 'twenty-shared/types';

export const useRelationsWithArgumentsVariables = ({
  objectMetadataItem,
  recordGqlFields,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordGqlFields?: RecordGqlFields;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useMemo(
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
};
