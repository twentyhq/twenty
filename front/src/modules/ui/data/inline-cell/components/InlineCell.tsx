import { useContext } from 'react';

import { FieldDisplay } from '@/ui/data/field/components/FieldDisplay';
import { FieldInput } from '@/ui/data/field/components/FieldInput';
import { FieldContext } from '@/ui/data/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/data/field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/ui/data/field/hooks/useIsFieldInputOnly';
import { FieldInputEvent } from '@/ui/data/field/types/FieldInputEvent';
import { isFieldRelation } from '@/ui/data/field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';

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
