import { type DashboardFilterChartFieldHandOver } from '@/page-layout/types/DashboardFilterChartFieldHandOver';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
import { removeTopLevelChartFilterConditionsOnField } from '@/page-layout/utils/removeTopLevelChartFilterConditionsOnField';
import {
  type ChartFilter,
  type DashboardFilterFieldResolution,
  type PageLayoutFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getDashboardFilterChartFieldHandOvers = ({
  settings,
  chartFilter,
}: {
  settings: {
    pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'label' | 'defaultValue'>;
    resolution: DashboardFilterFieldResolution;
  }[];
  chartFilter: ChartFilter | null | undefined;
}): DashboardFilterChartFieldHandOver[] =>
  settings.flatMap(({ pageLayoutFilter, resolution: { fieldMetadataId } }) => {
    if (!isDefined(fieldMetadataId)) {
      return [];
    }

    const filterWithoutFieldConditions =
      removeTopLevelChartFilterConditionsOnField({
        filter: chartFilter,
        fieldMetadataId,
      });

    return isDefined(filterWithoutFieldConditions)
      ? [
          {
            pageLayoutFilterId: pageLayoutFilter.id,
            label: getPageLayoutFilterDisplayLabel(pageLayoutFilter),
            hasDefaultValue: isDefined(pageLayoutFilter.defaultValue),
            fieldMetadataId,
            filterWithoutFieldConditions,
          },
        ]
      : [];
  });
