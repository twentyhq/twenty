import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';
import { type DashboardFilterWidgetSetting } from '@/page-layout/types/DashboardFilterWidgetSetting';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { getDashboardFilterWidgetSetting } from '@/page-layout/utils/getDashboardFilterWidgetSetting';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { type PageLayoutFilter } from 'twenty-shared/types';

export const getWidgetDashboardFilterSettings = ({
  pageLayoutFilters,
  configuration,
  fields,
  widgetFilter,
}: {
  pageLayoutFilters: Pick<PageLayoutFilter, 'id' | 'type' | 'label'>[];
  configuration: PageLayoutWidget['configuration'];
  fields: DashboardFilterWidgetField[];
  widgetFilter: DashboardFilterWidgetFilter;
}): (DashboardFilterWidgetSetting & {
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'label'>;
})[] => {
  const candidateFieldMetadataIds =
    getDashboardFilterWidgetCandidateFieldMetadataIds({
      configuration,
      widgetFilter,
    });
  const bindings = getWidgetDashboardFilterBindings(configuration);

  return pageLayoutFilters.map((pageLayoutFilter) => ({
    pageLayoutFilter,
    ...getDashboardFilterWidgetSetting({
      pageLayoutFilter,
      bindings,
      candidateFieldMetadataIds,
      fields,
    }),
  }));
};
