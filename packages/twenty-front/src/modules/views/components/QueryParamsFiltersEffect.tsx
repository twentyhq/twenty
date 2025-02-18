import { useEffect } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useApplyViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyViewFiltersToCurrentRecordFilters';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();

  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const setUnsavedViewFilter = useSetRecoilComponentFamilyStateV2(
    unsavedToUpsertViewFiltersComponentFamilyState,
    { viewId: viewIdQueryParam ?? currentViewId },
  );

  const { resetUnsavedViewStates } = useResetUnsavedViewStates();

  const { applyViewFiltersToCurrentRecordFilters } =
    useApplyViewFiltersToCurrentRecordFilters();

  useEffect(() => {
    if (!hasFiltersQueryParams) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        applyViewFiltersToCurrentRecordFilters(filtersFromParams);
        setUnsavedViewFilter(filtersFromParams);
      }
    });
  }, [
    applyViewFiltersToCurrentRecordFilters,
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetUnsavedViewStates,
    setUnsavedViewFilter,
  ]);

  return <></>;
};
