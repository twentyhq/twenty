import { useContext } from 'react';

import { GenericFieldDisplay } from '@/ui/field/components/GenericFieldDisplay';
import { GenericFieldInput } from '@/ui/field/components/GenericFieldInput';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/field/hooks/useIsFieldEmpty';
import { usePersistField } from '@/ui/field/hooks/usePersistField';
import { isFieldRelation } from '@/ui/field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';

import { useInlineCell } from '../hooks/useEditableField';

import { EditableField } from './EditableField';

export const InlineCell = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const isFieldEmpty = useIsFieldEmpty();

  const persistField = usePersistField();

  const { closeEditableField } = useInlineCell();

  const handleEnter = () => {
    persistField();
    closeEditableField();
  };

  const handleSubmit = () => {
    persistField();
    closeEditableField();
  };

  const handleCancel = () => {
    closeEditableField();
  };

  const handleEscape = () => {
    closeEditableField();
  };

  const handleTab = () => {
    persistField();
    closeEditableField();
  };

  const handleShiftTab = () => {
    persistField();
    closeEditableField();
  };

  return (
    <EditableField
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
        <GenericFieldInput
          onEnter={handleEnter}
          onCancel={handleCancel}
          onEscape={handleEscape}
          onSubmit={handleSubmit}
          onTab={handleTab}
          onShiftTab={handleShiftTab}
        />
      }
      displayModeContent={<GenericFieldDisplay />}
      isDisplayModeContentEmpty={isFieldEmpty}
      isDisplayModeFixHeight
    />
  );
};
