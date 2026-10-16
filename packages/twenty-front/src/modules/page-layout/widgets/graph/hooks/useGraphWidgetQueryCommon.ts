import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { sanitizeChartRecordFilters } from '@/side-panel/pages/page-layout/utils/sanitizeChartRecordFilters';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';
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
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    throw new Error('Aggregate field not found');
  }

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { recordFilters: sanitizedRecordFilters } = sanitizeChartRecordFilters({
    chartFilters: configuration.filter ?? {},
    fieldMetadataItems: objectMetadataItem.fields,
  });

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fieldMetadataItems: flattenedFieldMetadataItems,
    filterValueDependencies,
    recordFilters: sanitizedRecordFilters ?? [],
    recordFilterGroups: configuration.filter?.recordFilterGroups ?? [],
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
