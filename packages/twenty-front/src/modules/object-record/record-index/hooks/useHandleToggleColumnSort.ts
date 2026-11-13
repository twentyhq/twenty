import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
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

      if (!isDefined(correspondingColumnDefinition)) {
        return;
      }

      const currentRecordSorts = store.get(currentRecordSortsCallbackState);

      const primarySort = currentRecordSorts[0];
      const isSortingByThisColumn =
        primarySort?.fieldMetadataId === fieldMetadataId;

      const newSort: RecordSort = {
        id: isSortingByThisColumn ? primarySort.id : v4(),
        fieldMetadataId,
        direction: isSortingByThisColumn
          ? primarySort.direction === ViewSortDirection.ASC
            ? ViewSortDirection.DESC
            : ViewSortDirection.ASC
          : ViewSortDirection.ASC,
      };

      // A column-header sort replaces the view's sorts so the table is
      // ordered by that column alone; multi-column sorts stay in the Sort menu
      store.set(currentRecordSortsCallbackState, [newSort]);
    },
    [
      columnDefinitions,
      currentRecordSortsCallbackState,
      store,
    ],
  );

  return handleToggleColumnSort;
};
