import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { computeDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/utils/computeDashboardFilterCandidateDimensions';
import { useMemo } from 'react';

export const useDashboardFilterCandidateDimensions = (
  pageLayoutId: string,
): DashboardFilterCandidateDimension[] => {
  const { chartWidgets, isUsingBuiltInFilters, slots, bindingsByWidgetId } =
    useDashboardFilterEditor(pageLayoutId);

  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(
    () =>
      computeDashboardFilterCandidateDimensions({
        widgets: chartWidgets,
        objectMetadataItems,
        builtInSlotsAndBindings: isUsingBuiltInFilters
          ? { slots, bindingsByWidgetId }
          : undefined,
      }),
    [
      chartWidgets,
      objectMetadataItems,
      isUsingBuiltInFilters,
      slots,
      bindingsByWidgetId,
    ],
  );
};
