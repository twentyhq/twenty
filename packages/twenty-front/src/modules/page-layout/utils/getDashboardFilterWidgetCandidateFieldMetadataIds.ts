import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';
import { isDashboardFilterDataWidgetConfiguration } from '@/page-layout/utils/isDashboardFilterDataWidgetConfiguration';
import { getDashboardFilterCandidateFieldMetadataIds } from 'twenty-shared/utils';

export const getDashboardFilterWidgetCandidateFieldMetadataIds = ({
  configuration,
  widgetFilter,
}: {
  configuration: DashboardFilterWidgetConfiguration;
  widgetFilter: DashboardFilterWidgetFilter;
}): ReturnType<typeof getDashboardFilterCandidateFieldMetadataIds> => {
  if (!isDashboardFilterDataWidgetConfiguration(configuration)) {
    return { groupByFieldMetadataIds: [], widgetFilterFieldMetadataIds: [] };
  }

  return getDashboardFilterCandidateFieldMetadataIds({
    primaryAxisGroupByFieldMetadataId:
      configuration.primaryAxisGroupByFieldMetadataId,
    groupByFieldMetadataId: configuration.groupByFieldMetadataId,
    filter: widgetFilter,
  });
};
