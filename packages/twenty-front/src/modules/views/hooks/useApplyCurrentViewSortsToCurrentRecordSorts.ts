import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { useSortableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-sort/hooks/useSortableFieldMetadataItemsInRecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useRecoilValue } from 'recoil';

import { isDefined } from 'twenty-shared';

export const useApplyCurrentViewSortsToCurrentRecordSorts = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const setCurrentRecordSorts = useSetRecoilComponentStateV2(
    currentRecordSortsComponentState,
  );

  const { sortableFieldMetadataItems } =
    useSortableFieldMetadataItemsInRecordIndexContext();

  const applyCurrentViewSortsToCurrentRecordSorts = () => {
    const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
      fields: sortableFieldMetadataItems,
    });

    if (isDefined(currentView)) {
      setCurrentRecordSorts(
        mapViewSortsToSorts(currentView.viewSorts, sortDefinitions),
      );
    }
  };

  return {
    applyCurrentViewSortsToCurrentRecordSorts,
  };
};
