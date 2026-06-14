import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const validationPattern =
    fieldDefinition.metadata.settings?.validationPattern;
  const customValidationErrorMessage =
    fieldDefinition.metadata.settings?.validationErrorMessage;

  const isTextValid = (text: string) => {
    const trimmedText = text.trim();

    if (!isNonEmptyString(validationPattern) || trimmedText === '') {
      return true;
    }

    return new RegExp(validationPattern).test(trimmedText);
  };

  const validateAndNotifyOnError = (text: string) => {
    const isValid = isTextValid(text);

    if (!isValid) {
      enqueueErrorSnackBar({
        message: isNonEmptyString(customValidationErrorMessage)
          ? customValidationErrorMessage
          : t`Value does not match the required format`,
      });
    }

    return isValid;
  };

  const handleEnter = (newText: string) => {
    if (validateAndNotifyOnError(newText)) {
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
    if (validateAndNotifyOnError(newText)) {
      onClickOutside?.({
        newValue: newText.trim(),
        event,
      });
    }
  };

  const handleTab = (newText: string) => {
    if (validateAndNotifyOnError(newText)) {
      onTab?.({ newValue: newText.trim() });
    }
  };

  const handleShiftTab = (newText: string) => {
    if (validateAndNotifyOnError(newText)) {
      onShiftTab?.({ newValue: newText.trim() });
    }
  };

  const handleChange = (newText: string) => {
    setRecordFieldInputIsFieldInError(!isTextValid(newText));
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
