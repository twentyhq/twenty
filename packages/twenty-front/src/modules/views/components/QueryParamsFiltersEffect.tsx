import { useEffect } from 'react';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();

  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

  const setUnsavedViewFilter = useSetRecoilComponentFamilyStateV2(
    unsavedToUpsertViewFiltersComponentFamilyState,
    { viewId: viewIdQueryParam ?? currentViewId },
  );

  const { resetUnsavedViewStates } = useResetUnsavedViewStates();

  useEffect(() => {
    if (!hasFiltersQueryParams) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        setUnsavedViewFilter(filtersFromParams);
      }
    });
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetUnsavedViewStates,
    setUnsavedViewFilter,
  ]);

  return <></>;
};
