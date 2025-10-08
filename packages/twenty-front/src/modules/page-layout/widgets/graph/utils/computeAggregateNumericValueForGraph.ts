import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_DEFAULT_AGGREGATE_VALUE } from '@/page-layout/widgets/graph/constants/GraphDefaultAggregateValue.constant';
import isEmpty from 'lodash.isempty';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
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
    return GRAPH_DEFAULT_AGGREGATE_VALUE;
  }

  const field = objectMetadataItem.fields?.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(field)) {
    return Number(
      data?.[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
        AggregateOperations.COUNT
      ] ?? GRAPH_DEFAULT_AGGREGATE_VALUE,
    );
  }

  if (!isDefined(aggregateOperation)) {
    throw new Error('Missing aggregate operation');
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
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.NUMBER: {
      return Number(aggregateValue);
    }

    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE: {
      // For date fields, return the timestamp in milliseconds
      return new Date(aggregateValue as string).getTime();
    }

    default:
      return GRAPH_DEFAULT_AGGREGATE_VALUE;
  }
};
