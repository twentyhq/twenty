import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type RatioAggregateConfig } from '~/generated/graphql';

export const buildRatioNumeratorFilter = ({
  ratioConfig,
  ratioField,
  baseFilter,
}: {
  ratioConfig: RatioAggregateConfig | null | undefined;
  ratioField: FieldMetadataItem | undefined;
  baseFilter: RecordGqlOperationFilter | undefined;
}): RecordGqlOperationFilter | undefined => {
  if (!isDefined(ratioConfig) || !isDefined(ratioField)) {
    return baseFilter;
  }

  const fieldFilter = buildFieldFilter(
    ratioField.name,
    ratioField.type,
    ratioConfig.optionValue,
  );

  if (!isDefined(baseFilter)) {
    return fieldFilter;
  }

  return {
    and: [baseFilter, fieldFilter],
  };
};

const buildFieldFilter = (
  fieldName: string,
  fieldType: FieldMetadataType,
  optionValue: string,
): RecordGqlOperationFilter => {
  if (fieldType === FieldMetadataType.BOOLEAN) {
    return {
      [fieldName]: {
        eq: optionValue === 'true',
      },
    };
  }

  if (fieldType === FieldMetadataType.MULTI_SELECT) {
    return {
      [fieldName]: {
        containsAny: [optionValue],
      },
    };
  }

  return {
    [fieldName]: {
      eq: optionValue,
    },
  };
};
