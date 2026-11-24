import { isNonEmptyString } from '@sniptt/guards';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/rollup/constants/RollupFilterOperandsByFieldMetadataType';
import { type RollupSettingsFormFilter } from '@/settings/data-model/fields/forms/rollup/types/RollupSettingsFormFilter';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import {
  type FieldMetadataValueType,
  getFieldMetadataValueType,
} from 'twenty-shared/utils';

const getDefaultRollupFilterValue = ({
  fieldType,
  options,
}: {
  fieldType: FieldMetadataValueType;
  options: FieldMetadataItem['options'];
}): string => {
  if (fieldType === FieldMetadataType.BOOLEAN) {
    return 'true';
  }

  if (
    fieldType !== FieldMetadataType.SELECT &&
    fieldType !== FieldMetadataType.MULTI_SELECT
  ) {
    return '';
  }

  const firstOptionValue = options?.[0]?.value;

  return JSON.stringify(
    isNonEmptyString(firstOptionValue) ? [firstOptionValue] : [],
  );
};

export const getRollupFilterForFieldMetadataItem = ({
  filterId,
  fieldMetadataItem,
}: {
  filterId: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'type' | 'settings' | 'options'
  >;
}): RollupSettingsFormFilter => {
  const fieldType = getFieldMetadataValueType(fieldMetadataItem);
  const [operand = ViewFilterOperand.IS] =
    ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE[fieldType] ?? [];

  return {
    id: filterId,
    fieldMetadataId: fieldMetadataItem.id,
    operand,
    value: getDefaultRollupFilterValue({
      fieldType,
      options: fieldMetadataItem.options,
    }),
  };
};
