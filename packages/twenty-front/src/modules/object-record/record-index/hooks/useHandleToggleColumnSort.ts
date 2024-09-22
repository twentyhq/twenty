import { useCallback } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';
import { isDefined } from '~/utils/isDefined';

type UseHandleToggleColumnSortProps = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useHandleToggleColumnSort = ({
  viewBarId,
  objectNameSingular,
}: UseHandleToggleColumnSortProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { upsertCombinedViewSort } = useUpsertCombinedViewSorts(viewBarId);

  const handleToggleColumnSort = useCallback(
    (fieldMetadataId: string) => {
      const correspondingColumnDefinition = columnDefinitions.find(
        (columnDefinition) =>
          columnDefinition.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(correspondingColumnDefinition)) return;

      const newSort: Sort = {
        fieldMetadataId,
        definition: {
          fieldMetadataId,
          label: correspondingColumnDefinition.label,
          iconName: correspondingColumnDefinition.iconName,
        },
        direction: 'asc',
      };

      upsertCombinedViewSort(newSort);
    },
    [columnDefinitions, upsertCombinedViewSort],
  );

  return handleToggleColumnSort;
};
