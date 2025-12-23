import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';

export const TextFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleEnter = (newText: string) => {
    onEnter?.({ newValue: newText.trim() });
  };

  const handleEscape = (newText: string) => {
    onEscape?.({ newValue: newText.trim() });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.({
      newValue: newText.trim(),
      event,
    });
  };

  const handleTab = (newText: string) => {
    onTab?.({ newValue: newText.trim() });
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.({ newValue: newText.trim() });
  };

  const handleChange = (newText: string) => {
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newText));
  };

  return (
    <FieldInputContainer>
      <TextAreaInput
        instanceId={instanceId}
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={draftValue ?? ''}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        onChange={handleChange}
      />
    </FieldInputContainer>
  );
};
