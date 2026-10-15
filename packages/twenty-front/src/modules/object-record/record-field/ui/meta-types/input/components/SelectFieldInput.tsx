import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useAddSelectOption';
import { useCanAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useCanAddSelectOption';
import { useFilteredSelectOptionsFromRLSPredicates } from '@/object-record/record-field/ui/meta-types/hooks/useFilteredSelectOptionsFromRLSPredicates';
import { useSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useSelectField';
import { FieldInputDropdown } from '@/object-record/record-field/ui/meta-types/input/components/FieldInputDropdown';
import { SelectInput } from '@/ui/input/components/SelectInput';
import { useContext } from 'react';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const SelectFieldInput = () => {
  const { fieldDefinition, fieldValue } = useSelectField();
  const { addSelectOption } = useAddSelectOption(
    fieldDefinition.fieldMetadataId,
  );
  const { canAddSelectOption } = useCanAddSelectOption(
    fieldDefinition.fieldMetadataId,
  );

  const { onCancel, onSubmit } = useContext(FieldInputEventContext);

  const { filteredOptions: selectOptions, canSelectEmpty } =
    useFilteredSelectOptionsFromRLSPredicates({
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      objectMetadataNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      options: fieldDefinition.metadata.options,
    });

  const clearField = useClearField();

  const handleCancel = () => {
    onCancel?.();
  };

  const handleClearField = () => {
    clearField();
    onCancel?.();
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit?.({ newValue: option.value });
  };

  return (
    <FieldInputDropdown value={fieldValue} onDismiss={handleCancel}>
      <SelectInput
        onOptionSelected={handleSubmit}
        options={selectOptions}
        value={fieldValue}
        onClear={
          fieldDefinition.metadata.isNullable && canSelectEmpty
            ? handleClearField
            : undefined
        }
        clearLabel={fieldDefinition.label}
        onAddSelectOption={canAddSelectOption ? addSelectOption : undefined}
      />
    </FieldInputDropdown>
  );
};
