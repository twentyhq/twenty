import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { applyDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/applyDashboardFilterValuesToSearchParams';
import { getDashboardFilterSlotDefaultValue } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotDefaultValue';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
import { serializeDashboardFilterSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterSearchParams';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

  // The slots the values were last seeded for; null until the first read.
  const [seededSlots, setSeededSlots] = useState<DashboardFilterSlot[] | null>(
    null,
  );

  const hasInitialized = isDefined(seededSlots);

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
    setSeededSlots(slots);
  }, [
    ownsRouteLocation,
    hasInitialized,
    searchParams,
    slots,
    store,
    dashboardFilterValuesState,
  ]);

  // An editor giving a slot a default (new slot or changed default) seeds it the way a first visit would, for
  // a slot that is unset and absent from the URL; a value the viewer cleared stays cleared.
  useEffect(() => {
    if (!isDefined(seededSlots) || seededSlots === slots) {
      return;
    }

    setSeededSlots(slots);

    const currentValues = store.get(dashboardFilterValuesState);

    const urlValues = ownsRouteLocation
      ? parseDashboardFilterValuesFromSearchParams({
          searchParams,
          slotIds: slots.map((slot) => slot.id),
        })
      : {};

    const newlyDefaultedValues: Record<string, DashboardFilterValue> = {};

    for (const slot of slots) {
      const defaultValue = getDashboardFilterSlotDefaultValue(slot);

      if (
        !isDefined(defaultValue) ||
        isDefined(currentValues[slot.id]) ||
        isDefined(urlValues[slot.id])
      ) {
        continue;
      }

      const previousSlot = seededSlots.find(
        (seededSlot) => seededSlot.id === slot.id,
      );
      const previousDefaultValue = isDefined(previousSlot)
        ? getDashboardFilterSlotDefaultValue(previousSlot)
        : undefined;

      if (
        previousDefaultValue?.operand === defaultValue.operand &&
        previousDefaultValue?.value === defaultValue.value
      ) {
        continue;
      }

      newlyDefaultedValues[slot.id] = defaultValue;
    }

    if (Object.keys(newlyDefaultedValues).length === 0) {
      return;
    }

    store.set(dashboardFilterValuesState, {
      ...currentValues,
      ...newlyDefaultedValues,
    });
  }, [
    ownsRouteLocation,
    seededSlots,
    slots,
    searchParams,
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
