import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getAggregateOperationShortLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationShortLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import isEmpty from 'lodash.isempty';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { formatAmount } from '~/utils/format/formatAmount';
import { formatNumber } from '~/utils/format/number';
import { isDefined } from '~/utils/isDefined';
import { formatDateString } from '~/utils/string/formatDateString';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

export const computeAggregateValueAndLabel = ({
  data,
  objectMetadataItem,
  fieldMetadataId,
  aggregateOperation,
  fallbackFieldName,
  dateFormat,
  timeFormat,
  timeZone,
}: {
  data: AggregateRecordsData;
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataId?: string | null;
  aggregateOperation?: ExtendedAggregateOperations | null;
  fallbackFieldName?: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
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
      labelWithFieldName: `${getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)}`,
    };
  }

  if (!isDefined(aggregateOperation)) {
    throw new Error('Missing aggregate operation');
  }

  const aggregateValue = data[field.name]?.[aggregateOperation];

  let value;

  const displayAsRelativeDate = field?.settings?.displayAsRelativeDate;

  if (
    COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AGGREGATE_OPERATIONS,
    )
  ) {
    value = aggregateValue;
  } else if (!isDefined(aggregateValue)) {
    value = '-';
  } else if (
    PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AGGREGATE_OPERATIONS,
    )
  ) {
    value = `${formatNumber(Number(aggregateValue) * 100)}%`;
  } else {
    switch (field.type) {
      case FieldMetadataType.Currency: {
        value = Number(aggregateValue);
        value = formatAmount(value / 1_000_000);
        break;
      }

      case FieldMetadataType.Number: {
        value = Number(aggregateValue);
        const { decimals, type } = field.settings ?? {};
        value =
          type === 'percentage'
            ? `${formatNumber(value * 100, decimals)}%`
            : formatNumber(value, decimals);
        break;
      }

      case FieldMetadataType.DateTime: {
        value = aggregateValue as string;
        value = formatDateTimeString({
          value,
          displayAsRelativeDate,
          timeZone,
          dateFormat,
          timeFormat,
        });
        break;
      }

      case FieldMetadataType.Date: {
        value = aggregateValue as string;
        value = formatDateString({
          value,
          displayAsRelativeDate,
          timeZone,
          dateFormat,
        });
        break;
      }
    }
  }
  const label = getAggregateOperationShortLabel(aggregateOperation);
  const labelWithFieldName =
    aggregateOperation === AGGREGATE_OPERATIONS.count
      ? `${getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)}`
      : `${getAggregateOperationLabel(aggregateOperation)} of ${field.label}`;

  return {
    value,
    label,
    labelWithFieldName,
  };
};
