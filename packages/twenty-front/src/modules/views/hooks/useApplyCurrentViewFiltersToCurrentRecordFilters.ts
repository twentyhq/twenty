import { useFilterDefinitionsFromFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterDefinitionsFromFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

import { isDefined } from 'twenty-shared';

export const useApplyCurrentViewFiltersToCurrentRecordFilters = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { filterDefinitions } =
    useFilterDefinitionsFromFilterableFieldMetadataItems();

  const applyCurrentViewFiltersToCurrentRecordFilters = () => {
    const currentView = views.find((view) => view.id === currentViewId);

    if (isDefined(currentView)) {
      setCurrentRecordFilters(
        mapViewFiltersToFilters(currentView.viewFilters, filterDefinitions),
      );
    }
  };

  return {
    applyCurrentViewFiltersToCurrentRecordFilters,
  };
};
