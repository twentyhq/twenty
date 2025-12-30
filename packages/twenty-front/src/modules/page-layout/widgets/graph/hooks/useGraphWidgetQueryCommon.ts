import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';

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

  const aggregateField = objectMetadataItem.readableFields.find(
    (field) => field.id === aggregateFieldId,
  );

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const { userTimezone } = useUserTimezone();

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters: configuration.filter?.recordFilters ?? [],
    recordFilterGroups: configuration.filter?.recordFilterGroups ?? [],
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
