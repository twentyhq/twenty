import { type DashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/types/DashboardFilterWidgetCandidateFieldMetadataIds';
import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { isDashboardFilterDataWidgetConfiguration } from '@/page-layout/utils/isDashboardFilterDataWidgetConfiguration';
import { getDashboardFilterCandidateFieldMetadataIds } from 'twenty-shared/utils';

export const getDashboardFilterWidgetCandidateFieldMetadataIds = ({
  configuration,
  viewFilterFieldMetadataIds,
}: {
  configuration: DashboardFilterWidgetConfiguration;
  viewFilterFieldMetadataIds: string[];
}): DashboardFilterWidgetCandidateFieldMetadataIds => {
  if (configuration.__typename === 'RecordTableConfiguration') {
    return {
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: viewFilterFieldMetadataIds,
    };
  }

  if (!isDashboardFilterDataWidgetConfiguration(configuration)) {
    return { groupByFieldMetadataIds: [], widgetFilterFieldMetadataIds: [] };
  }

  return getDashboardFilterCandidateFieldMetadataIds({
    primaryAxisGroupByFieldMetadataId:
      configuration.primaryAxisGroupByFieldMetadataId,
    groupByFieldMetadataId: configuration.groupByFieldMetadataId,
    filter: configuration.filter,
  });
};
