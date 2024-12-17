import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import isEmpty from 'lodash.isempty';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const computeAggregateValueAndLabel = ({
  data,
  objectMetadataItem,
  fieldMetadataId,
  aggregateOperation,
  fallbackFieldName,
}: {
  data: AggregateRecordsData;
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataId?: string | null;
  aggregateOperation?: AGGREGATE_OPERATIONS | null;
  fallbackFieldName?: string;
}) => {
  if (isEmpty(data)) {
    return {};
  }
  const field = objectMetadataItem.fields?.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(field)) {
    if (!fallbackFieldName) {
      throw new Error('Missing fallback field name');
    }
    return {
      value: data?.[fallbackFieldName]?.[AGGREGATE_OPERATIONS.count],
      label: `${getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)}`,
    };
  }

  if (!isDefined(aggregateOperation)) {
    throw new Error('Missing aggregate operation');
  }

  const aggregateValue = data[field.name]?.[aggregateOperation];

  const value =
    isDefined(aggregateValue) && field.type === FieldMetadataType.Currency
      ? Number(aggregateValue) / 1_000_000
      : aggregateValue;

  const label =
    aggregateOperation === AGGREGATE_OPERATIONS.count
      ? `${getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)}`
      : `${getAggregateOperationLabel(aggregateOperation)} of ${field.name}`;

  return {
    value,
    label,
  };
};
