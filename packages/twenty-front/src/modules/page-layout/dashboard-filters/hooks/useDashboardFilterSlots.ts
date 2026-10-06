import { dashboardFilterSlotsComponentSelector } from '@/page-layout/dashboard-filters/states/dashboardFilterSlotsComponentSelector';
import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { useMemo } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';

export const useDashboardFilterSlots = (): {
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
} => {
  const { slotDefinitions, bindingsByWidgetId } = useAtomComponentSelectorValue(
    dashboardFilterSlotsComponentSelector,
  );

  const { t } = useLingui();

  const slots = useMemo(
    () =>
      slotDefinitions.map(({ label, ...slot }) => ({
        ...slot,
        label: isString(label) ? label : t(label),
      })),
    [slotDefinitions, t],
  );

  return { slots, bindingsByWidgetId };
};
