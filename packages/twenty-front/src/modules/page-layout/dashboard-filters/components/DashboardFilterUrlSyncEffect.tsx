import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
import { serializeDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterValuesToSearchParams';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterUrlSyncEffectProps = {
  pageLayoutId: string;
  slots: DashboardFilterSlot[];
};

// One-way after the first render: the URL, completed by slot defaults, replaces the values once, then the values are mirrored into the URL.
export const DashboardFilterUrlSyncEffect = ({
  pageLayoutId,
  slots,
}: DashboardFilterUrlSyncEffectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  useEffect(() => {
    if (!hasInitializedFromUrl) {
      setDashboardFilterValues(
        resolveInitialDashboardFilterValues({
          slots,
          valuesFromUrl: parseDashboardFilterValuesFromSearchParams({
            searchParams,
            pageLayoutId,
            slots,
          }),
        }),
      );

      setHasInitializedFromUrl(true);

      return;
    }

    setSearchParams(
      (previousSearchParams) => {
        const nextSearchParams = serializeDashboardFilterValuesToSearchParams({
          searchParams: previousSearchParams,
          pageLayoutId,
          slots,
          values: dashboardFilterValues,
        });

        return nextSearchParams.toString() === previousSearchParams.toString()
          ? previousSearchParams
          : nextSearchParams;
      },
      { replace: true },
    );
  }, [
    hasInitializedFromUrl,
    pageLayoutId,
    slots,
    searchParams,
    setSearchParams,
    dashboardFilterValues,
    setDashboardFilterValues,
  ]);

  return null;
};
