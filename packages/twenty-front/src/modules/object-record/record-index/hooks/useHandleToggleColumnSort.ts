import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
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

  const currentRecordSortsCallbackState = useRecoilComponentCallbackState(
    currentRecordSortsComponentState,
  );

  const handleToggleColumnSort = useRecoilCallback(
    ({ snapshot }) =>
      (fieldMetadataId: string) => {
        const correspondingColumnDefinition = columnDefinitions.find(
          (columnDefinition) =>
            columnDefinition.fieldMetadataId === fieldMetadataId,
        );

        if (!isDefined(correspondingColumnDefinition)) return;

        const currentRecordSorts = getSnapshotValue(
          snapshot,
          currentRecordSortsCallbackState,
        );

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
    [columnDefinitions, currentRecordSortsCallbackState, upsertRecordSort],
  );

  return handleToggleColumnSort;
};
