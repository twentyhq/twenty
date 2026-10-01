import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { FieldInputAnchorContext } from '@/object-record/record-field/ui/contexts/FieldInputAnchorContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { Dropdown } from 'twenty-ui/components';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useAddSelectOption';
import { useCanAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useCanAddSelectOption';
import { useFilteredSelectOptionsFromRLSPredicates } from '@/object-record/record-field/ui/meta-types/hooks/useFilteredSelectOptionsFromRLSPredicates';
import { useMultiSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectField';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { useContext } from 'react';

export const MultiSelectFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useMultiSelectField();
  const { addSelectOption } = useAddSelectOption(
    fieldDefinition.fieldMetadataId,
  );
  const { canAddSelectOption } = useCanAddSelectOption(
    fieldDefinition.fieldMetadataId,
  );

  const { onSubmit, onEnter, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

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

  const { anchorRef, align, sideOffset, alignOffset, collisionPadding } =
    useContext(FieldInputAnchorContext);

  const handleCancel = () => {
    onSubmit?.({ newValue: draftValue });
  };

  return (
    <Dropdown.Root
      type="picker"
      multiple
      open
      onOpenChange={(open) => {
        if (!open) {
          handleCancel();
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
            handleTab({ newValue: draftValue });
            return;
          }

          handleCancel();
        }}
      >
        <MultiSelectInput
          onEnter={() => {
            if (isDefined(onEnter)) {
              onEnter({ newValue: draftValue });
              return;
            }

            handleCancel();
          }}
          options={selectOptions}
          onOptionSelected={handleOptionSelected}
          values={draftValue}
          onAddSelectOption={canAddSelectOption ? addSelectOption : undefined}
        />
      </DropdownContent>
    </Dropdown.Root>
  );
};
