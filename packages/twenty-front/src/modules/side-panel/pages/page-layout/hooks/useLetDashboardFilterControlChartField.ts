import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { resetChartFiltersSettingsInitialization } from '@/side-panel/pages/page-layout/utils/resetChartFiltersSettingsInitialization';
import { useStore } from 'jotai';
import { type ChartFilter } from 'twenty-shared/types';

export const useLetDashboardFilterControlChartField = ({
  pageLayoutId,
  widget,
}: {
  pageLayoutId: string;
  widget: Pick<PageLayoutWidget, 'id' | 'objectMetadataId' | 'configuration'>;
}) => {
  const store = useStore();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const letDashboardFilterControlChartField = ({
    pageLayoutFilterId,
    fieldMetadataId,
    filterWithoutFieldConditions,
  }: {
    pageLayoutFilterId: string;
    fieldMetadataId: string;
    filterWithoutFieldConditions: ChartFilter;
  }) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        filter: filterWithoutFieldConditions,
        dashboardFilterBindings: getDashboardFilterBindingsWithWidgetSetting({
          dashboardFilterBindings: getWidgetDashboardFilterBindings(
            widget.configuration,
          ),
          pageLayoutFilterId,
          value: fieldMetadataId,
        }),
      },
    });

    resetChartFiltersSettingsInitialization({ store, widgets: [widget] });
  };

  return { letDashboardFilterControlChartField };
};
