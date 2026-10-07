import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { applyDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/applyDashboardFilterValuesToSearchParams';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
import { serializeDashboardFilterSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterSearchParams';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
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

  const store = useStore();

  const dashboardFilterValuesState = useAtomComponentStateCallbackState(
    dashboardFilterValuesComponentState,
  );

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  const [hasInitialized, setHasInitialized] = useState(false);

  // The URL is authoritative on mount and again after Back/Forward, so a reload, a shared link and history
  // restore the same values; a slot the URL leaves out falls back to its default. The router applies our own
  // writes in a transition, so instead of remembering what was written, a URL whose dashboard params already
  // match the state is taken as our own and left alone.
  useEffect(() => {
    if (!ownsRouteLocation && hasInitialized) {
      return;
    }

    const currentValues = store.get(dashboardFilterValuesState);

    const isUrlInSyncWithState =
      serializeDashboardFilterSearchParams(searchParams) ===
      serializeDashboardFilterSearchParams(
        applyDashboardFilterValuesToSearchParams({
          searchParams: new URLSearchParams(),
          dashboardFilterValues: currentValues,
        }),
      );

    if (hasInitialized && isUrlInSyncWithState) {
      return;
    }

    store.set(
      dashboardFilterValuesState,
      resolveInitialDashboardFilterValues({
        slots,
        urlValues: ownsRouteLocation
          ? parseDashboardFilterValuesFromSearchParams({
              searchParams,
              slotIds: slots.map((slot) => slot.id),
            })
          : {},
      }),
    );
    setHasInitialized(true);
  }, [
    ownsRouteLocation,
    hasInitialized,
    searchParams,
    slots,
    store,
    dashboardFilterValuesState,
  ]);

  // Reading the store rather than the subscribed value keeps a write that runs in the same commit as a
  // re-seed from clobbering the URL with values that are already stale.
  useEffect(() => {
    if (!ownsRouteLocation || !hasInitialized) {
      return;
    }

    const nextSearchParams = applyDashboardFilterValuesToSearchParams({
      searchParams,
      dashboardFilterValues: store.get(dashboardFilterValuesState),
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
    hasInitialized,
    dashboardFilterValues,
    searchParams,
    hash,
    state,
    navigate,
    store,
    dashboardFilterValuesState,
  ]);

  return null;
};
