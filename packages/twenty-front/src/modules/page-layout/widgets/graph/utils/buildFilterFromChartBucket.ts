import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ViewFilterOperand,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

type BuildFilterFromChartBucketParams = {
  fieldMetadataItem: FieldMetadataItem;
  bucketRawValue: unknown;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null; // TODO: Will be used for date filtering
  subFieldName?: string | null;
  timezone?: string; // TODO: Will be used for date filtering
};

const formatChartFilterValue = (
  fieldType: FieldMetadataType,
  bucketRawValue: unknown,
  operand: ViewFilterOperand,
): string => {
  const stringValue = String(bucketRawValue);

  const needsJsonArray =
    operand === ViewFilterOperand.IS &&
    [
      FieldMetadataType.SELECT,
      FieldMetadataType.UUID,
      FieldMetadataType.RELATION,
    ].includes(fieldType);

  return needsJsonArray ? JSON.stringify([stringValue]) : stringValue;
};

export const buildFilterFromChartBucket = ({
  fieldMetadataItem,
  bucketRawValue,
  subFieldName,
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

  const availableOperands = getRecordFilterOperands({
    filterType: getFilterTypeFromFieldType(fieldMetadataItem.type),
    subFieldName: subFieldName ?? undefined,
  });

  if (availableOperands.length === 0) {
    return [];
  }

  const operand = availableOperands[0];

  const value = formatChartFilterValue(
    fieldMetadataItem.type,
    bucketRawValue,
    operand,
  );

  return [
    {
      fieldName,
      operand,
      value,
    },
  ];
};
