import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { applyDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/applyDashboardFilterValuesToSearchParams';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterUrlSyncEffectProps = {
  slots: DashboardFilterSlot[];
};

export const DashboardFilterUrlSyncEffect = ({
  slots,
}: DashboardFilterUrlSyncEffectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  // The URL is authoritative on first mount so a reload or shared link restores the same values.
  useEffect(() => {
    if (hasInitializedFromUrl) {
      return;
    }

    setDashboardFilterValues(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: slots.map((slot) => slot.id),
      }),
    );
    setHasInitializedFromUrl(true);
  }, [hasInitializedFromUrl, searchParams, setDashboardFilterValues, slots]);

  useEffect(() => {
    if (!hasInitializedFromUrl) {
      return;
    }

    const nextSearchParams = applyDashboardFilterValuesToSearchParams({
      searchParams,
      dashboardFilterValues,
    });

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [
    hasInitializedFromUrl,
    dashboardFilterValues,
    searchParams,
    setSearchParams,
  ]);

  return null;
};
