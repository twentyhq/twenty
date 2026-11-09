import { type DashboardFilterWidget } from '@/page-layout/types/DashboardFilterWidget';
import { type DashboardFilterWidgetRow } from '@/page-layout/types/DashboardFilterWidgetRow';
import { getDashboardFilterWidgetSetting } from '@/page-layout/utils/getDashboardFilterWidgetSetting';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export const getDashboardFilterWidgetRows = ({
  pageLayoutFilter,
  dashboardFilterWidgets,
}: {
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'type'>;
  dashboardFilterWidgets: DashboardFilterWidget[];
}): DashboardFilterWidgetRow[] =>
  dashboardFilterWidgets.map(
    ({
      widgetId,
      widgetTitle,
      tabTitle,
      isReadOnly,
      bindings,
      candidateFieldMetadataIds,
      fields,
    }) => ({
      widgetId,
      widgetTitle,
      tabTitle,
      isReadOnly,
      ...getDashboardFilterWidgetSetting({
        pageLayoutFilter,
        bindings,
        candidateFieldMetadataIds,
        fields,
      }),
    }),
  );
