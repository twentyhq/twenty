import { GenericFieldDisplay } from '@/ui/field/components/GenericFieldDisplay';
import { GenericFieldInput } from '@/ui/field/components/GenericFieldInput';
import { FieldInputEvent } from '@/ui/field/input/components/TextFieldInput';

import { useEditableCell } from '../hooks/useEditableCell';

import { EditableCell } from './EditableCell';

export const TableCell = () => {
  const { closeEditableCell } = useEditableCell();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
  };

  const handleCancel = () => {
    closeEditableCell();
  };

  const handleEscape = () => {
    closeEditableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
  };

  return (
    <EditableCell
      editModeContent={
        <GenericFieldInput
          onCancel={handleCancel}
          onClickOutside={handleCancel}
          onEnter={handleEnter}
          onEscape={handleEscape}
          onShiftTab={handleShiftTab}
          onSubmit={handleSubmit}
          onTab={handleTab}
        />
      }
      nonEditModeContent={<GenericFieldDisplay />}
    ></EditableCell>
  );
};
