import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { useSortableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-sort/hooks/useSortableFieldMetadataItemsInRecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewSort } from '@/views/types/ViewSort';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetRecoilComponentStateV2(
    currentRecordSortsComponentState,
  );

  const { sortableFieldMetadataItems } =
    useSortableFieldMetadataItemsInRecordIndexContext();

  const applyViewSortsToCurrentRecordSorts = (viewSorts: ViewSort[]) => {
    const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
      fields: sortableFieldMetadataItems,
    });

    const recordSortsToApply = mapViewSortsToSorts(viewSorts, sortDefinitions);

    setCurrentRecordSorts(recordSortsToApply);
  };

  return {
    applyViewSortsToCurrentRecordSorts,
  };
};
