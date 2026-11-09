import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { getDashboardFilterCandidateFieldMetadataIds } from 'twenty-shared/utils';

export const getDashboardFilterWidgetCandidateFieldMetadataIds = ({
  configuration,
  viewFilterFieldMetadataIds,
}: {
  configuration: PageLayoutWidget['configuration'];
  viewFilterFieldMetadataIds: string[];
}): ReturnType<typeof getDashboardFilterCandidateFieldMetadataIds> => {
  if (isWidgetConfigurationOfType(configuration, 'RecordTableConfiguration')) {
    return {
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: viewFilterFieldMetadataIds,
    };
  }

  if (!isWidgetConfigurationOfTypeGraph(configuration)) {
    return { groupByFieldMetadataIds: [], widgetFilterFieldMetadataIds: [] };
  }

  return getDashboardFilterCandidateFieldMetadataIds({
    primaryAxisGroupByFieldMetadataId:
      'primaryAxisGroupByFieldMetadataId' in configuration
        ? configuration.primaryAxisGroupByFieldMetadataId
        : undefined,
    groupByFieldMetadataId:
      'groupByFieldMetadataId' in configuration
        ? configuration.groupByFieldMetadataId
        : undefined,
    filter: configuration.filter,
  });
};
