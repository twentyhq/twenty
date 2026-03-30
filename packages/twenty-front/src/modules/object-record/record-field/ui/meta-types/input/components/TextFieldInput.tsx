import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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

  const { enqueueErrorSnackBar } = useSnackBar();

  const setIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const validationPattern = fieldDefinition.metadata.settings?.validationPattern;
  const validationErrorMessage =
    fieldDefinition.metadata.settings?.validationErrorMessage ??
    'Value does not match the required format';

  const validate = (text: string): boolean => {
    if (validationPattern && text) {
      const regex = new RegExp(validationPattern);

      if (!regex.test(text)) {
        enqueueErrorSnackBar({ message: validationErrorMessage });
        return false;
      }
    }
    return true;
  };

  const handleEnter = (newText: string) => {
    if (validate(newText)) {
      onEnter?.({ newValue: newText.trim() });
    }
  };

  const handleEscape = (newText: string) => {
    onEscape?.({ newValue: newText.trim() });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    if (validate(newText)) {
      onClickOutside?.({
        newValue: newText.trim(),
        event,
      });
    }
  };

  const handleTab = (newText: string) => {
    if (validate(newText)) {
      onTab?.({ newValue: newText.trim() });
    }
  };

  const handleShiftTab = (newText: string) => {
    if (validate(newText)) {
      onShiftTab?.({ newValue: newText.trim() });
    }
  };

  const handleChange = (newText: string) => {
    if (validationPattern && newText) {
      const regex = new RegExp(validationPattern);

      setIsFieldInError(!regex.test(newText));
    } else {
      setIsFieldInError(false);
    }
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
