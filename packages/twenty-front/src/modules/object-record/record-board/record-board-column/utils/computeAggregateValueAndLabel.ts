import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getAggregateOperationShortLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationShortLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';
import isEmpty from 'lodash.isempty';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { formatAmount } from '~/utils/format/formatAmount';
import { formatNumber } from '~/utils/format/number';
import { formatDateString } from '~/utils/string/formatDateString';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

export const computeAggregateValueAndLabel = ({
  data,
  objectMetadataItem,
  fieldMetadataId,
  aggregateOperation,
  dateFormat,
  timeFormat,
  timeZone,
  localeCatalog,
}: {
  data: AggregateRecordsData;
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataId?: string | null;
  aggregateOperation?: ExtendedAggregateOperations | null;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
  localeCatalog: Locale;
}) => {
  if (isEmpty(data)) {
    return {};
  }
  const field = objectMetadataItem.fields?.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(field)) {
    return {
      value:
        data?.[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
          AggregateOperations.COUNT
        ],
      label: getAggregateOperationLabel(AggregateOperations.COUNT),
      labelWithFieldName: getAggregateOperationLabel(AggregateOperations.COUNT),
    };
  }

  if (!isDefined(aggregateOperation)) {
    throw new Error('Missing aggregate operation');
  }

  const aggregateValue = data[field.name]?.[aggregateOperation];

  let value;

  const dateFieldSettings = field?.settings;

  if (
    COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    value = aggregateValue;
  } else if (!isDefined(aggregateValue)) {
    value = '-';
  } else if (
    PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    )
  ) {
    value = `${formatNumber(Number(aggregateValue) * 100)}%`;
  } else {
    switch (field.type) {
      case FieldMetadataType.CURRENCY: {
        value = Number(aggregateValue);
        value = formatAmount(value / 1_000_000);
        break;
      }

      case FieldMetadataType.NUMBER: {
        value = Number(aggregateValue);
        const { decimals, type } = field.settings ?? {};
        value =
          type === 'percentage'
            ? `${formatNumber(value * 100, decimals)}%`
            : formatNumber(value, decimals);
        break;
      }

      case FieldMetadataType.DATE_TIME: {
        value = aggregateValue as string;
        value = formatDateTimeString({
          value,
          timeZone,
          dateFormat,
          timeFormat,
          dateFieldSettings,
          localeCatalog,
        });
        break;
      }

      case FieldMetadataType.DATE: {
        value = aggregateValue as string;
        value = formatDateString({
          value,
          timeZone,
          dateFormat,
          dateFieldSettings,
          localeCatalog,
        });
        break;
      }
    }
  }
  const aggregateLabel = t(getAggregateOperationShortLabel(aggregateOperation));
  const fieldLabel = field.label;
  const labelWithFieldName =
    aggregateOperation === AggregateOperations.COUNT
      ? `${getAggregateOperationLabel(AggregateOperations.COUNT)}`
      : t`${aggregateLabel} of ${fieldLabel}`;

  return {
    value,
    label: aggregateLabel,
    labelWithFieldName,
  };
};
