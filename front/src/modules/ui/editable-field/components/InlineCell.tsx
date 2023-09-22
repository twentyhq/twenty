import { useContext } from 'react';

import { FieldDisplay } from '@/ui/field/components/FieldDisplay';
import { FieldInput } from '@/ui/field/components/FieldInput';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/field/hooks/useIsFieldEmpty';
import { FieldInputEvent } from '@/ui/field/meta-types/input/components/TextFieldInput';
import { isFieldRelation } from '@/ui/field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';

import { useInlineCell } from '../hooks/useEditableField';

import { InlineCellContainer } from './InlineCellContainer';

export const InlineCell = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const isFieldEmpty = useIsFieldEmpty();

  const { closeEditableField } = useInlineCell();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableField();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableField();
  };

  const handleCancel = () => {
    closeEditableField();
  };

  const handleEscape = () => {
    closeEditableField();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableField();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableField();
  };

  return (
    <InlineCellContainer
      useEditButton={fieldDefinition.useEditButton}
      customEditHotkeyScope={
        isFieldRelation(fieldDefinition)
          ? {
              scope: RelationPickerHotkeyScope.RelationPicker,
            }
          : undefined
      }
      IconLabel={fieldDefinition.Icon}
      editModeContent={
        <FieldInput
          onEnter={handleEnter}
          onCancel={handleCancel}
          onEscape={handleEscape}
          onSubmit={handleSubmit}
          onTab={handleTab}
          onShiftTab={handleShiftTab}
        />
      }
      displayModeContent={<FieldDisplay />}
      isDisplayModeContentEmpty={isFieldEmpty}
      isDisplayModeFixHeight
    />
  );
};
