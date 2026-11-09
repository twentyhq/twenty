import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useWidgetDashboardFilter } from '@/page-layout/hooks/useWidgetDashboardFilter';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { sanitizeChartRecordFilters } from '@/side-panel/pages/page-layout/utils/sanitizeChartRecordFilters';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  replaceWidgetFilterPeriodsWithDashboardFilter,
} from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

export const useGraphWidgetQueryCommon = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration:
    | BarChartConfiguration
    | AggregateChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const aggregateFieldId = configuration.aggregateFieldMetadataId;

  const aggregateField = findFieldMetadataItemByFieldMetadataId({
    fieldMetadataItems: objectMetadataItem.readableFields,
    fieldMetadataId: aggregateFieldId,
  });

  if (!isDefined(aggregateField)) {
    throw new Error(doNotTranslate('Aggregate field not found'));
  }

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { appliedFields, gqlOperationFilter: dashboardGqlOperationFilter } =
    useWidgetDashboardFilter();

  const chartFilters: ChartFilters = configuration.filter ?? {};

  const { filter: chartFiltersWithoutReplacedPeriods } =
    replaceWidgetFilterPeriodsWithDashboardFilter({
      filter: chartFilters,
      fieldMetadataIds: appliedFields.map(
        ({ fieldMetadataId }) => fieldMetadataId,
      ),
    });

  const { recordFilters: sanitizedRecordFilters } = sanitizeChartRecordFilters({
    chartFilters: chartFiltersWithoutReplacedPeriods,
    fieldMetadataItems: objectMetadataItem.fields,
  });

  const widgetGqlOperationFilter = computeRecordGqlOperationFilter({
    fieldMetadataItems: flattenedFieldMetadataItems,
    filterValueDependencies,
    recordFilters: (sanitizedRecordFilters ?? []).map((recordFilter) => ({
      ...recordFilter,
      value: recordFilter.value ?? '',
    })),
    recordFilterGroups: chartFiltersWithoutReplacedPeriods.recordFilterGroups,
  });

  const gqlOperationFilter = combineFilters([
    widgetGqlOperationFilter,
    dashboardGqlOperationFilter,
  ]);

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
