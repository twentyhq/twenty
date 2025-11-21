import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

import { FieldMetadataType, type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type AggregateOperations } from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';
import { formatDateString } from '~/utils/string/formatDateString';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

export const transformAggregateRawValueIntoAggregateDisplayValue = ({
  aggregateFieldMetadataItem,
  aggregateOperation,
  aggregateRawValue,
  dateFormat,
  timeFormat,
  timeZone,
  localeCatalog,
}: {
  aggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  aggregateOperation: ExtendedAggregateOperations;
  aggregateRawValue: Nullable<string | number>;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
  localeCatalog: Locale;
}): string => {
  if (!isDefined(aggregateRawValue)) {
    return '-';
  } else if (
    COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    return `${aggregateRawValue}`;
  } else if (!isDefined(aggregateFieldMetadataItem)) {
    return '-';
  } else if (
    PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    return `${formatNumber(Number(aggregateRawValue) * 100)}%`;
  } else {
    switch (aggregateFieldMetadataItem.type) {
      case FieldMetadataType.CURRENCY: {
        return formatToShortNumber(Number(aggregateRawValue) / 1_000_000);
      }

      case FieldMetadataType.NUMBER: {
        const castedValue = Number(aggregateRawValue);
        const { decimals, type } = aggregateFieldMetadataItem.settings ?? {};
        return type === 'percentage'
          ? `${formatNumber(castedValue * 100, { decimals })}%`
          : formatNumber(castedValue, { decimals });
      }

      case FieldMetadataType.DATE_TIME: {
        const dateFieldSettings = aggregateFieldMetadataItem.settings;

        const dateISOStringRawValue = aggregateRawValue as string;

        return formatDateTimeString({
          value: dateISOStringRawValue,
          timeZone,
          dateFormat,
          timeFormat,
          dateFieldSettings,
          localeCatalog,
        });
      }

      case FieldMetadataType.DATE: {
        const dateFieldSettings = aggregateFieldMetadataItem.settings;

        const plainDateStringRawValue = aggregateRawValue as string;

        return formatDateString({
          value: plainDateStringRawValue,
          timeZone,
          dateFormat,
          dateFieldSettings,
          localeCatalog,
        });
      }
    }
  }

  return '-';
};
