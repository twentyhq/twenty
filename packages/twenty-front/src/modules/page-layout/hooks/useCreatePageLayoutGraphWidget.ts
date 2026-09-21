import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
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
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  BarChartLayout,
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
      const existingVerticalBarChartCount = store
        .get(pageLayoutDraftState)
        .tabs.flatMap((tab) => tab.widgets)
        .filter(
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
        configuration: buildDefaultBarChartConfiguration({
          fieldSelection,
          timezone: timeZone,
          firstDayOfTheWeek: calendarStartDay,
        }),
        objectMetadataId: fieldSelection?.objectMetadataId,
      });
    },
    [
      calendarStartDay,
      createPageLayoutWidget,
      pageLayoutDraftState,
      store,
      timeZone,
    ],
  );

  return { createPageLayoutGraphWidget };
};
