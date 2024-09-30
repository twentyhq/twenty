import { useEffect } from 'react';

import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { isDefined } from 'twenty-ui';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();

  const setUnsavedViewFilter = useSetRecoilComponentFamilyStateV2(
    unsavedToUpsertViewFiltersComponentFamilyState,
    { viewId: viewIdQueryParam },
  );

  const { resetUnsavedViewStates } = useResetUnsavedViewStates();
  const { currentViewId } = useGetCurrentView();

  useEffect(() => {
    if (!hasFiltersQueryParams) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        setUnsavedViewFilter(filtersFromParams);
      }
    });

    return () => {
      if (isDefined(currentViewId)) {
        resetUnsavedViewStates(currentViewId);
      }
    };
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetUnsavedViewStates,
    setUnsavedViewFilter,
    currentViewId,
  ]);

  return <></>;
};
