import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { isDefined } from 'twenty-shared/utils';
import { BarChartGroupMode, type PageLayoutWidget } from '~/generated/graphql';

export const buildBarChartGroupByConfigUpdate = (
  fieldMetadataId: string | null,
  subFieldName: string | null,
  configuration: ChartConfiguration,
): Partial<PageLayoutWidget['configuration']> => {
  const baseConfig: Partial<PageLayoutWidget['configuration']> = {
    secondaryAxisGroupByFieldMetadataId: fieldMetadataId,
    secondaryAxisGroupBySubFieldName: subFieldName,
  };

  if (configuration.__typename === 'BarChartConfiguration') {
    return {
      ...baseConfig,
      groupMode: isDefined(fieldMetadataId)
        ? (configuration.groupMode ?? BarChartGroupMode.STACKED)
        : undefined,
    };
  }

  return baseConfig;
};
