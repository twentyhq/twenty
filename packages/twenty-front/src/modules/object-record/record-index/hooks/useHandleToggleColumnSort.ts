import { useCallback } from 'react';

import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { ViewSortDirection } from '~/generated/graphql';

type UseHandleToggleColumnSortProps = {
  objectMetadataItemId: string;
};

export const useHandleToggleColumnSort = ({
  objectMetadataItemId,
}: UseHandleToggleColumnSortProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromObjectMetadata(objectMetadataItem);

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
        direction: ViewSortDirection.ASC,
      };

      upsertRecordSort(newSort);
    },
    [columnDefinitions, upsertRecordSort],
  );

  return handleToggleColumnSort;
};
