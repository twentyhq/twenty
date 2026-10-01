import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { FieldInputAnchorContext } from '@/object-record/record-field/ui/contexts/FieldInputAnchorContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { Dropdown } from 'twenty-ui/components';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useAddSelectOption';
import { useCanAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useCanAddSelectOption';
import { useFilteredSelectOptionsFromRLSPredicates } from '@/object-record/record-field/ui/meta-types/hooks/useFilteredSelectOptionsFromRLSPredicates';
import { useSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useSelectField';
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

  const { onCancel, onSubmit, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const { filteredOptions: selectOptions, canSelectEmpty } =
    useFilteredSelectOptionsFromRLSPredicates({
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      objectMetadataNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      options: fieldDefinition.metadata.options,
    });

  const { anchorRef, align, sideOffset, alignOffset, collisionPadding } =
    useContext(FieldInputAnchorContext);

  const clearField = useClearField();

  const selectedOption = selectOptions.find(
    (option) => option.value === fieldValue,
  );
  const handleClearField = () => {
    clearField();
    onCancel?.();
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit?.({ newValue: option.value });
  };

  return (
    <Dropdown.Root
      type="picker"
      open
      onOpenChange={(open) => {
        if (!open) {
          onCancel?.();
        }
      }}
      onInteractOutside={(event) => {
        if (event.target instanceof HTMLInputElement) {
          event.preventDefault();
        }
      }}
    >
      <DropdownContent
        anchor={anchorRef}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        aria-label={fieldDefinition.label}
        finalFocus={false}
        onKeyDown={(event) => {
          if (event.key !== Key.Tab) {
            return;
          }

          const handleTab = event.shiftKey ? onShiftTab : onTab;

          if (isDefined(handleTab)) {
            event.preventDefault();
            handleTab({ newValue: fieldValue });
            return;
          }

          onCancel?.();
        }}
      >
        <SelectInput
          onOptionSelected={handleSubmit}
          options={selectOptions}
          defaultOption={selectedOption}
          onClear={
            fieldDefinition.metadata.isNullable && canSelectEmpty
              ? handleClearField
              : undefined
          }
          clearLabel={fieldDefinition.label}
          onAddSelectOption={canAddSelectOption ? addSelectOption : undefined}
        />
      </DropdownContent>
    </Dropdown.Root>
  );
};
