import { useEffect } from 'react';

import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useViewFromQueryParams();

  const setUnsavedViewFilter = useSetRecoilComponentStateV2(
    unsavedToUpsertViewFiltersComponentState,
  );

  const { resetCurrentView } = useResetCurrentView();

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
      resetCurrentView();
    };
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetCurrentView,
    setUnsavedViewFilter,
  ]);

  return <></>;
};
