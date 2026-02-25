import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { ViewSortDirection } from '~/generated-metadata/graphql';

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

  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const handleToggleColumnSort = useCallback(
    (fieldMetadataId: string) => {
      const correspondingColumnDefinition = columnDefinitions.find(
        (columnDefinition) =>
          columnDefinition.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(correspondingColumnDefinition)) return;

      const currentRecordSorts = store.get(currentRecordSortsCallbackState);

      const existingSort = currentRecordSorts.find(
        (sort) => sort.fieldMetadataId === fieldMetadataId,
      );

      const newSort: RecordSort = {
        id: existingSort?.id ?? v4(),
        fieldMetadataId,
        direction: existingSort
          ? existingSort.direction === ViewSortDirection.ASC
            ? ViewSortDirection.DESC
            : ViewSortDirection.ASC
          : ViewSortDirection.ASC,
      };

      upsertRecordSort(newSort);
    },
    [
      columnDefinitions,
      currentRecordSortsCallbackState,
      store,
      upsertRecordSort,
    ],
  );

  return handleToggleColumnSort;
};
