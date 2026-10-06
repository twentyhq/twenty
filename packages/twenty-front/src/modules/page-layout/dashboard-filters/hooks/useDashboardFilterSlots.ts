import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { computeBuiltInDateBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInDateBindings';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

const EMPTY_SLOTS: DashboardFilterSlot[] = [];
const EMPTY_BINDINGS_BY_WIDGET_ID: DashboardFilterBindingsByWidgetId = {};

// Slots and bindings come from built-in rules until they are persisted on the page layout.
export const useDashboardFilterSlots = (): {
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
} => {
  const { currentPageLayout } = useCurrentPageLayout();
  const { objectMetadataItems } = useObjectMetadataItems();

  const dashboardPageLayout =
    currentPageLayout?.type === PageLayoutType.DASHBOARD
      ? currentPageLayout
      : undefined;

  const slots = useMemo<DashboardFilterSlot[]>(
    () =>
      dashboardPageLayout
        ? [
            {
              id: BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE,
              label: t`Date`,
              filterType: 'DATE_TIME',
            },
          ]
        : EMPTY_SLOTS,
    [dashboardPageLayout],
  );

  const bindingsByWidgetId = useMemo<DashboardFilterBindingsByWidgetId>(() => {
    if (!dashboardPageLayout) {
      return EMPTY_BINDINGS_BY_WIDGET_ID;
    }

    const builtInDateBindingByWidgetId = computeBuiltInDateBindings({
      widgets: dashboardPageLayout.tabs.flatMap((tab) => tab.widgets),
      objectMetadataItems,
    });

    return Object.fromEntries(
      Object.entries(builtInDateBindingByWidgetId).map(
        ([widgetId, builtInDateBinding]) => [
          widgetId,
          { [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE]: builtInDateBinding },
        ],
      ),
    );
  }, [dashboardPageLayout, objectMetadataItems]);

  return { slots, bindingsByWidgetId };
};
