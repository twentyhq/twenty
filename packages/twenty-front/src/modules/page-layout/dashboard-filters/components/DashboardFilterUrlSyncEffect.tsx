import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { serializeDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterValuesToSearchParams';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterUrlSyncEffectProps = {
  slots: DashboardFilterSlot[];
};

// One-way after the first render: the URL seeds the values once, then the values are mirrored into the URL.
export const DashboardFilterUrlSyncEffect = ({
  slots,
}: DashboardFilterUrlSyncEffectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  useEffect(() => {
    if (!hasInitializedFromUrl) {
      const dashboardFilterValuesFromUrl =
        parseDashboardFilterValuesFromSearchParams({
          searchParams,
          slotIds: slots.map((slot) => slot.id),
        });

      if (Object.keys(dashboardFilterValuesFromUrl).length > 0) {
        setDashboardFilterValues((previousDashboardFilterValues) => ({
          ...previousDashboardFilterValues,
          ...dashboardFilterValuesFromUrl,
        }));
      }

      setHasInitializedFromUrl(true);

      return;
    }

    const nextSearchParams = serializeDashboardFilterValuesToSearchParams({
      searchParams,
      values: dashboardFilterValues,
    });

    if (nextSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(nextSearchParams, { replace: true });
    }
  }, [
    hasInitializedFromUrl,
    slots,
    searchParams,
    setSearchParams,
    dashboardFilterValues,
    setDashboardFilterValues,
  ]);

  return null;
};
