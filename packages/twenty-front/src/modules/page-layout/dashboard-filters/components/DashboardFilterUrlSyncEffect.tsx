import { useInitializeDashboardFilterValues } from '@/page-layout/dashboard-filters/hooks/useInitializeDashboardFilterValues';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { serializeDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterValuesToSearchParams';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect, useMemo } from 'react';
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

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  const valuesFromUrl = useMemo(
    () =>
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        pageLayoutId,
        slots,
      }),
    [searchParams, pageLayoutId, slots],
  );

  const hasInitialized = useInitializeDashboardFilterValues({
    slots,
    valuesFromUrl,
  });

  useEffect(() => {
    if (!hasInitialized) {
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
    hasInitialized,
    pageLayoutId,
    slots,
    setSearchParams,
    dashboardFilterValues,
  ]);

  return null;
};
