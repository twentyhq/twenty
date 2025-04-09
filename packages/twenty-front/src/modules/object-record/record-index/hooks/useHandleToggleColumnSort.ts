import { useCallback } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

type UseHandleToggleColumnSortProps = {
  objectNameSingular: string;
};

export const useHandleToggleColumnSort = ({
  objectNameSingular,
}: UseHandleToggleColumnSortProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

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
        direction: 'asc',
      };

      upsertRecordSort(newSort);
    },
    [columnDefinitions, upsertRecordSort],
  );

  return handleToggleColumnSort;
};
