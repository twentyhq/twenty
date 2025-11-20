import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildDateFilterForDayGranularity } from '@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';
import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
  timezone?: string;
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
  timezone,
}: BuildFilterFromChartBucketParams): ChartFilter[] => {
  const fieldName = isNonEmptyString(subFieldName)
    ? `${fieldMetadataItem.name}.${subFieldName}`
    : fieldMetadataItem.name;

  if (!isDefined(bucketRawValue) || !isNonEmptyString(String(bucketRawValue))) {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_EMPTY,
        value: '',
      },
    ];
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.DATE ||
    fieldMetadataItem.type === FieldMetadataType.DATE_TIME
  ) {
    const parsedBucketDate = new Date(String(bucketRawValue));

    if (isNaN(parsedBucketDate.getTime())) {
      return [];
    }

    if (
      dateGranularity === ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK ||
      dateGranularity ===
        ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR ||
      dateGranularity === ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
    ) {
      return [];
    }

    if (
      !dateGranularity ||
      dateGranularity === ObjectRecordGroupByDateGranularity.DAY ||
      dateGranularity === ObjectRecordGroupByDateGranularity.NONE
    ) {
      return buildDateFilterForDayGranularity(
        parsedBucketDate,
        fieldMetadataItem.type,
        fieldName,
        timezone,
      );
    }

    if (isTimeRangeDateGranularity(dateGranularity)) {
      return buildDateRangeFiltersForGranularity(
        parsedBucketDate,
        dateGranularity,
        fieldMetadataItem.type,
        fieldName,
        timezone,
      );
    }

    return [];
  }

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.SELECT:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify([String(bucketRawValue)]),
        },
      ];

    case FieldMetadataType.MULTI_SELECT:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: JSON.stringify([String(bucketRawValue)]),
        },
      ];

    case FieldMetadataType.TEXT:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.BOOLEAN:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.RATING:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.UUID:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify([String(bucketRawValue)]),
        },
      ];

    case FieldMetadataType.CURRENCY:
      if (isNonEmptyString(subFieldName) && subFieldName === 'currencyCode') {
        return [
          {
            fieldName,
            operand: ViewFilterOperand.IS,
            value: JSON.stringify([String(bucketRawValue)]),
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

    case FieldMetadataType.FULL_NAME:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.EMAILS:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.PHONES:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.LINKS:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.ADDRESS:
      if (isNonEmptyString(subFieldName) && subFieldName === 'addressCountry') {
        return [
          {
            fieldName,
            operand: ViewFilterOperand.IS,
            value: JSON.stringify([String(bucketRawValue)]),
          },
        ];
      }
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.ACTOR:
      if (isNonEmptyString(subFieldName) && subFieldName === 'source') {
        return [
          {
            fieldName,
            operand: ViewFilterOperand.IS,
            value: JSON.stringify([String(bucketRawValue)]),
          },
        ];
      }
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.ARRAY:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: JSON.stringify([String(bucketRawValue)]),
        },
      ];

    case FieldMetadataType.RAW_JSON:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.CONTAINS,
          value: String(bucketRawValue),
        },
      ];

    case FieldMetadataType.RELATION:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify([String(bucketRawValue)]),
        },
      ];

    case FieldMetadataType.POSITION:
    case FieldMetadataType.MORPH_RELATION:
    case FieldMetadataType.TS_VECTOR:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.RICH_TEXT_V2:
      return [];

    default:
      return [
        {
          fieldName,
          operand: ViewFilterOperand.IS,
          value: String(bucketRawValue),
        },
      ];
  }
};
