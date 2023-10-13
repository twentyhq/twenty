import { useContext } from 'react';

import { FieldDisplay } from '@/ui/Data/Field/components/FieldDisplay';
import { FieldInput } from '@/ui/Data/Field/components/FieldInput';
import { FieldContext } from '@/ui/Data/Field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/Data/Field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/ui/Data/Field/hooks/useIsFieldInputOnly';
import { FieldInputEvent } from '@/ui/Data/Field/types/FieldInputEvent';
import { isFieldRelation } from '@/ui/Data/Field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/ui/Input/Relation Picker/types/RelationPickerHotkeyScope';

import { useInlineCell } from '../hooks/useInlineCell';

import { InlineCellContainer } from './InlineCellContainer';

export const InlineCell = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const isFieldEmpty = useIsFieldEmpty();

  const isFieldInputOnly = useIsFieldInputOnly();

  const { closeInlineCell } = useInlineCell();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleCancel = () => {
    closeInlineCell();
  };

  const handleEscape = () => {
    closeInlineCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  return (
    <InlineCellContainer
      buttonIcon={fieldDefinition.buttonIcon}
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
          onClickOutside={handleClickOutside}
        />
      }
      displayModeContent={<FieldDisplay />}
      isDisplayModeContentEmpty={isFieldEmpty}
      isDisplayModeFixHeight
      editModeContentOnly={isFieldInputOnly}
    />
  );
};
