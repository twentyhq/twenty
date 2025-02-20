import { useCallback } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';

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

  const { upsertRecordSort } = useUpsertRecordSort();

  const handleToggleColumnSort = useCallback(
    async (fieldMetadataId: string) => {
      const correspondingColumnDefinition = columnDefinitions.find(
        (columnDefinition) =>
          columnDefinition.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(correspondingColumnDefinition)) return;

      const newSort: RecordSort = {
        id: v4(),
        fieldMetadataId,
        definition: {
          fieldMetadataId,
          label: correspondingColumnDefinition.label,
          iconName: correspondingColumnDefinition.iconName,
        },
        direction: 'asc',
      };

      upsertRecordSort(newSort);

      await upsertCombinedViewSort(newSort);
    },
    [columnDefinitions, upsertCombinedViewSort, upsertRecordSort],
  );

  return handleToggleColumnSort;
};
