import { isNonEmptyString } from '@sniptt/guards';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/rollup/constants/RollupFilterOperandsByFieldMetadataType';
import { type RollupSettingsFormFilter } from '@/settings/data-model/fields/forms/rollup/types/RollupSettingsFormFilter';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { getFieldMetadataValueType } from 'twenty-shared/utils';

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
  const firstOptionValue = fieldMetadataItem.options?.[0]?.value;

  if (fieldType === FieldMetadataType.BOOLEAN) {
    return {
      id: filterId,
      fieldMetadataId: fieldMetadataItem.id,
      operand,
      value: 'true',
    };
  }

  if (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  ) {
    return {
      id: filterId,
      fieldMetadataId: fieldMetadataItem.id,
      operand,
      value: JSON.stringify(
        isNonEmptyString(firstOptionValue) ? [firstOptionValue] : [],
      ),
    };
  }

  return {
    id: filterId,
    fieldMetadataId: fieldMetadataItem.id,
    operand,
    value: '',
  };
};
