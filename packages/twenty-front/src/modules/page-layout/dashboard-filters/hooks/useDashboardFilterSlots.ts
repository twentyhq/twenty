import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useBuiltInDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useBuiltInDashboardFilterSlots';
import { resolveDashboardFilterSlots } from '@/page-layout/dashboard-filters/utils/resolveDashboardFilterSlots';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

type UseDashboardFilterSlotsResult = {
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  isUsingBuiltInSlots: boolean;
};

export const useDashboardFilterSlots = (): UseDashboardFilterSlotsResult => {
  const { currentPageLayout } = useCurrentPageLayout();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const builtInSlots = useBuiltInDashboardFilterSlots();

  const { slots, bindingsByWidgetId, isUsingBuiltInSlots } = useMemo(
    () =>
      resolveDashboardFilterSlots({
        pageLayout: currentPageLayout,
        objectMetadataItems,
        builtInSlots,
      }),
    [currentPageLayout, objectMetadataItems, builtInSlots],
  );

  return { slots, bindingsByWidgetId, isUsingBuiltInSlots };
};
