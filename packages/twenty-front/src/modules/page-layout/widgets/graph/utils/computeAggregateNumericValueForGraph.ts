import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_DEFAULT_AGGREGATE_VALUE } from '@/page-layout/widgets/graph/constants/GraphDefaultAggregateValue';
import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const computeAggregateNumericValueForGraph = ({
  data,
  objectMetadataItem,
  fieldMetadataId,
  aggregateOperation,
}: {
  data: AggregateRecordsData;
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataId?: string | null;
  aggregateOperation?: ExtendedAggregateOperations | null;
}): number => {
  if (isEmpty(data)) {
    throw new Error('Empty aggregate records data');
  }

  const field = objectMetadataItem.fields?.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(field)) {
    throw new Error(`Field with id ${fieldMetadataId} not found`);
  }

  if (!isDefined(aggregateOperation)) {
    throw new Error(`Missing aggregate operation for field ${field.name}`);
  }

  const aggregateValue = data[field.name]?.[aggregateOperation];

  if (
    COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    return isDefined(aggregateValue)
      ? Number(aggregateValue)
      : GRAPH_DEFAULT_AGGREGATE_VALUE;
  }

  if (!isDefined(aggregateValue)) {
    return GRAPH_DEFAULT_AGGREGATE_VALUE;
  }

  if (
    PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    return Number(aggregateValue) * 100;
  }

  switch (field.type) {
    case FieldMetadataType.CURRENCY: {
      // Convert from micros (millionths) to actual currency amount
      return Number(aggregateValue) / 1_000_000;
    }

    case FieldMetadataType.NUMBER: {
      return Number(aggregateValue);
    }

    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE: {
      return new Date(aggregateValue as string).getTime();
    }

    default:
      throw new Error(`Unsupported field type ${field.type}`);
  }
};
