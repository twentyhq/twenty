import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getEndUnitOfDateTime,
  getPlainDateFromDate,
  getStartUnitOfDateTime,
  isDefined,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

type BuildFilterFromChartBucketParams = {
  fieldMetadataItem: FieldMetadataItem;
  bucketRawValue: unknown;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  subFieldName?: string | null;
};

const isTimeRangeDateGranularity = (
  granularity?: ObjectRecordGroupByDateGranularity | null,
): boolean => {
  if (!granularity) return false;
  return [
    ObjectRecordGroupByDateGranularity.MONTH,
    ObjectRecordGroupByDateGranularity.QUARTER,
    ObjectRecordGroupByDateGranularity.YEAR,
  ].includes(granularity);
};

export const buildFilterFromChartBucket = ({
  fieldMetadataItem,
  bucketRawValue,
  dateGranularity,
  subFieldName,
}: BuildFilterFromChartBucketParams): ChartFilter[] => {
  const fieldName = isNonEmptyString(subFieldName)
    ? `${fieldMetadataItem.name}.${subFieldName}`
    : fieldMetadataItem.name;

  if (!isDefined(bucketRawValue) || bucketRawValue === '') {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_EMPTY,
        value: '',
      },
    ];
  }

  if (
    fieldMetadataItem.type !== FieldMetadataType.DATE &&
    fieldMetadataItem.type !== FieldMetadataType.DATE_TIME
  ) {
    if (fieldMetadataItem.type === FieldMetadataType.SELECT) {
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify([String(bucketRawValue)]),
        },
      ];
    }

    if (fieldMetadataItem.type === FieldMetadataType.TEXT) {
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];
    }

    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS,
        value: String(bucketRawValue),
      },
    ];
  }

  const date = new Date(String(bucketRawValue));

  if (
    dateGranularity === ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK ||
    dateGranularity === ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR ||
    dateGranularity === ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
  ) {
    return [];
  }

  if (
    !dateGranularity ||
    dateGranularity === ObjectRecordGroupByDateGranularity.DAY ||
    dateGranularity === ObjectRecordGroupByDateGranularity.NONE
  ) {
    if (fieldMetadataItem.type === FieldMetadataType.DATE) {
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: getPlainDateFromDate(date),
        },
      ];
    }

    if (fieldMetadataItem.type === FieldMetadataType.DATE_TIME) {
      const startOfDayDate = getStartUnitOfDateTime(date, 'DAY');
      const endOfDayDate = getEndUnitOfDateTime(date, 'DAY');

      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS_AFTER,
          value: startOfDayDate.toISOString(),
        },
        {
          fieldName,
          operand: ViewFilterOperand.IS_BEFORE,
          value: endOfDayDate.toISOString(),
        },
      ];
    }
  }

  if (isTimeRangeDateGranularity(dateGranularity)) {
    let start: Date;
    let end: Date;

    if (dateGranularity === ObjectRecordGroupByDateGranularity.MONTH) {
      start = getStartUnitOfDateTime(date, 'MONTH');
      end = getEndUnitOfDateTime(date, 'MONTH');
    } else if (dateGranularity === ObjectRecordGroupByDateGranularity.QUARTER) {
      const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
      start = new Date(date.getFullYear(), quarterStartMonth, 1);
      const quarterEndMonth = quarterStartMonth + 2;
      end = getEndUnitOfDateTime(
        new Date(date.getFullYear(), quarterEndMonth, 1),
        'MONTH',
      );
    } else {
      start = getStartUnitOfDateTime(date, 'YEAR');
      end = getEndUnitOfDateTime(date, 'YEAR');
    }

    if (fieldMetadataItem.type === FieldMetadataType.DATE_TIME) {
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS_AFTER,
          value: start.toISOString(),
        },
        {
          fieldName,
          operand: ViewFilterOperand.IS_BEFORE,
          value: end.toISOString(),
        },
      ];
    }

    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_AFTER,
        value: getPlainDateFromDate(start),
      },
      {
        fieldName,
        operand: ViewFilterOperand.IS_BEFORE,
        value: getPlainDateFromDate(end),
      },
    ];
  }

  return [];
};
