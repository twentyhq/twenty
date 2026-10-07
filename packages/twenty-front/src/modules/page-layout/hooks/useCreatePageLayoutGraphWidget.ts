import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { computeBindingsForNewWidget } from '@/page-layout/dashboard-filters/utils/computeBindingsForNewWidget';
import { useCreatePageLayoutWidget } from '@/page-layout/hooks/useCreatePageLayoutWidget';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { getWidgetTitle } from '@/page-layout/utils/getWidgetTitle';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  BarChartLayout,
  FeatureFlagKey,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const useCreatePageLayoutGraphWidget = ({
  pageLayoutId: pageLayoutIdFromProps,
  tabListInstanceId,
}: {
  pageLayoutId: string;
  tabListInstanceId: string;
}) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();
  const { timeZone, calendarStartDay } = useDateTimeFormat();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const isJsonFilterEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_JSON_FILTER_ENABLED,
  );

  const { createPageLayoutWidget } = useCreatePageLayoutWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const createPageLayoutGraphWidget = useCallback(
    ({
      fieldSelection,
    }: {
      fieldSelection?: GraphWidgetFieldSelection;
    }): PageLayoutWidget => {
      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const existingWidgets = pageLayoutDraft.tabs.flatMap(
        (tab) => tab.widgets,
      );

      // Only a dashboard that already left the built-ins has slots a new chart can be bound to.
      const dashboardFilters = pageLayoutDraft.dashboardFilters as
        | DashboardFilterSlot[]
        | null
        | undefined;

      const dashboardFilterBindings =
        isDefined(dashboardFilters) &&
        isDefined(fieldSelection?.objectMetadataId)
          ? computeBindingsForNewWidget({
              widget: { objectMetadataId: fieldSelection.objectMetadataId },
              slots: dashboardFilters,
              existingWidgets,
              objectMetadataItems,
              isJsonFilterEnabled,
            })
          : undefined;

      const existingVerticalBarChartCount = existingWidgets.filter(
        (widget) =>
          widget.type === WidgetType.GRAPH &&
          isWidgetConfigurationOfType(
            widget.configuration,
            'BarChartConfiguration',
          ) &&
          widget.configuration.layout === BarChartLayout.VERTICAL,
      ).length;

      return createPageLayoutWidget({
        type: WidgetType.GRAPH,
        title: getWidgetTitle(
          {
            configurationType: WidgetConfigurationType.BAR_CHART,
            layout: BarChartLayout.VERTICAL,
          },
          existingVerticalBarChartCount,
        ),
        configuration: {
          ...buildDefaultBarChartConfiguration({
            fieldSelection,
            timezone: timeZone,
            firstDayOfTheWeek: calendarStartDay,
          }),
          ...(isDefined(dashboardFilterBindings)
            ? { dashboardFilterBindings }
            : {}),
        },
        objectMetadataId: fieldSelection?.objectMetadataId,
      });
    },
    [
      calendarStartDay,
      createPageLayoutWidget,
      isJsonFilterEnabled,
      objectMetadataItems,
      pageLayoutDraftState,
      store,
      timeZone,
    ],
  );

  return { createPageLayoutGraphWidget };
};
