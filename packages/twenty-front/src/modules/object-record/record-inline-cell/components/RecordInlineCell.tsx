import { useContext } from 'react';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';

import { useInlineCell } from '../hooks/useInlineCell';

import { RecordInlineCellContainer } from './RecordInlineCellContainer';

type RecordInlineCellProps = {
  readonly?: boolean;
};

export const RecordInlineCell = ({ readonly }: RecordInlineCellProps) => {
  const { fieldDefinition, entityId } = useContext(FieldContext);

  const buttonIcon = useGetButtonIcon();

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

  const { getIcon } = useIcons();

  return (
    <RecordInlineCellContainer
      readonly={readonly}
      buttonIcon={buttonIcon}
      customEditHotkeyScope={
        isFieldRelation(fieldDefinition)
          ? {
              scope: RelationPickerHotkeyScope.RelationPicker,
            }
          : undefined
      }
      IconLabel={
        fieldDefinition.iconName ? getIcon(fieldDefinition.iconName) : undefined
      }
      label={fieldDefinition.label}
      labelWidth={fieldDefinition.labelWidth}
      showLabel={fieldDefinition.showLabel}
      editModeContent={
        <FieldInput
          recordFieldInputdId={`${entityId}-${fieldDefinition?.metadata?.fieldName}`}
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
