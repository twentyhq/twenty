import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useAddSelectOption';
import { useCanAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useCanAddSelectOption';
import { useFilteredSelectOptionsFromRLSPredicates } from '@/object-record/record-field/ui/meta-types/hooks/useFilteredSelectOptionsFromRLSPredicates';
import { useMultiSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectField';
import { FieldInputDropdown } from '@/object-record/record-field/ui/meta-types/input/components/FieldInputDropdown';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const MultiSelectFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useMultiSelectField();
  const { addSelectOption } = useAddSelectOption(
    fieldDefinition.fieldMetadataId,
  );
  const { canAddSelectOption } = useCanAddSelectOption(
    fieldDefinition.fieldMetadataId,
  );

  const { onSubmit, onEnter } = useContext(FieldInputEventContext);

  const { filteredOptions: selectOptions } =
    useFilteredSelectOptionsFromRLSPredicates({
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      objectMetadataNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      options: fieldDefinition.metadata.options,
    });

  const handleOptionSelected = (newDraftValue: FieldMultiSelectValue) => {
    setDraftValue(newDraftValue);
  };

  const handleCancel = () => {
    onSubmit?.({ newValue: draftValue });
  };

  const handleEnter = () => {
    if (!isDefined(onEnter)) {
      handleCancel();
      return;
    }

    onEnter({ newValue: draftValue });
  };

  return (
    <FieldInputDropdown value={draftValue} onDismiss={handleCancel} multiple>
      <MultiSelectInput
        onEnter={handleEnter}
        options={selectOptions}
        onOptionSelected={handleOptionSelected}
        values={draftValue}
        onAddSelectOption={canAddSelectOption ? addSelectOption : undefined}
      />
    </FieldInputDropdown>
  );
};
