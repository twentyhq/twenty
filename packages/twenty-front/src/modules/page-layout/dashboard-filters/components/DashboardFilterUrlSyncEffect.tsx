import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { applyDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/applyDashboardFilterValuesToSearchParams';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterUrlSyncEffectProps = {
  slots: DashboardFilterSlot[];
};

export const DashboardFilterUrlSyncEffect = ({
  slots,
}: DashboardFilterUrlSyncEffectProps) => {
  const { search, hash, state } = useLocation();
  const navigate = useNavigate();

  // A dashboard opened in a side panel must not read or write the main page's URL.
  const { ownsRouteLocation } = useWorkspaceSurface();

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  // The URL is authoritative on first mount so a reload or shared link restores the same values.
  useEffect(() => {
    if (!ownsRouteLocation || hasInitializedFromUrl) {
      return;
    }

    setDashboardFilterValues(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: slots.map((slot) => slot.id),
      }),
    );
    setHasInitializedFromUrl(true);
  }, [
    ownsRouteLocation,
    hasInitializedFromUrl,
    searchParams,
    setDashboardFilterValues,
    slots,
  ]);

  useEffect(() => {
    if (!ownsRouteLocation || !hasInitializedFromUrl) {
      return;
    }

    const nextSearchParams = applyDashboardFilterValuesToSearchParams({
      searchParams,
      dashboardFilterValues,
    });

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    // useSearchParams would drop the active tab hash; navigate keeps it and the history entry.
    navigate(
      { search: `?${nextSearchParams.toString()}`, hash },
      { replace: true, state },
    );
  }, [
    ownsRouteLocation,
    hasInitializedFromUrl,
    dashboardFilterValues,
    searchParams,
    hash,
    state,
    navigate,
  ]);

  return null;
};
