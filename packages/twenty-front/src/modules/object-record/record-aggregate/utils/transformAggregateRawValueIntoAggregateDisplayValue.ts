import { type Locale } from 'date-fns';

import { type DateFormat } from '@/localization/constants/DateFormat';
import { type NumberFormat } from '@/localization/constants/NumberFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

import { FieldMetadataType, type Nullable } from 'twenty-shared/types';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';
import {
  type AggregateOperations,
  ChartNumberFormat,
} from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';
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
  numberFormat,
  chartNumberFormat,
}: {
  aggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  aggregateOperation: ExtendedAggregateOperations;
  aggregateRawValue: Nullable<string | number>;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
  localeCatalog: Locale;
  numberFormat?: NumberFormat;
  chartNumberFormat?: ChartNumberFormat;
}): string => {
  if (!isDefined(aggregateRawValue)) {
    return '-';
  } else if (
    COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    return formatNumber(Number(aggregateRawValue), { format: numberFormat });
  } else if (!isDefined(aggregateFieldMetadataItem)) {
    return '-';
  } else if (
    PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    return `${formatNumber(Number(aggregateRawValue) * 100, { format: numberFormat })}%`;
  } else {
    switch (aggregateFieldMetadataItem.type) {
      case FieldMetadataType.CURRENCY: {
        const amount = Number(aggregateRawValue) / 1_000_000;
        return chartNumberFormat === ChartNumberFormat.FULL
          ? formatNumber(amount, { decimals: 2, format: numberFormat })
          : formatToShortNumber(amount);
      }

      case FieldMetadataType.NUMBER: {
        const castedValue = Number(aggregateRawValue);
        const { decimals, type } = aggregateFieldMetadataItem.settings ?? {};
        if (type === 'percentage') {
          return `${formatNumber(castedValue * 100, { decimals, format: numberFormat })}%`;
        }
        return chartNumberFormat === ChartNumberFormat.SHORT
          ? formatToShortNumber(castedValue)
          : formatNumber(castedValue, { decimals, format: numberFormat });
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
