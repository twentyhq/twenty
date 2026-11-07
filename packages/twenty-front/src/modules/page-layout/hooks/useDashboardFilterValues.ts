import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/parseDashboardFilterValuesFromSearchParams';
import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FeatureFlagKey,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const useDashboardFilterValues = () => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const pageLayoutFilters =
    isDashboardFiltersEnabled &&
    currentPageLayout.type === PageLayoutType.DASHBOARD
      ? (currentPageLayout.filters ?? [])
      : [];

  const urlValueByPageLayoutFilterId =
    parseDashboardFilterValuesFromSearchParams(searchParams);

  const dashboardFilterValueById = getEffectiveDashboardFilterValues({
    pageLayoutFilters,
    urlValueByPageLayoutFilterId,
  });

  // Not setSearchParams, which drops the hash that holds the active tab
  // oxlint-disable-next-line twenty/no-navigate-prefer-link
  const setDashboardFilterValue = ({
    pageLayoutFilterId,
    value,
  }: {
    pageLayoutFilterId: string;
    value: PageLayoutFilterValue | null;
  }) => {
    navigate(
      {
        search: setDashboardFilterValueInSearchParams({
          searchParams,
          pageLayoutFilterId,
          value,
        }).toString(),
        hash: location.hash,
      },
      { replace: true, state: location.state },
    );
  };

  return {
    pageLayoutFilters,
    urlValueByPageLayoutFilterId,
    dashboardFilterValueById,
    setDashboardFilterValue,
  };
};
