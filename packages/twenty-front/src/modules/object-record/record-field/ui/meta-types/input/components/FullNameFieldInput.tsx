import { useFullNameField } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameField';
import { type FieldDoubleText } from '@/object-record/record-field/ui/types/FieldDoubleText';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';

import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { isDoubleTextFieldEmpty } from '@/object-record/record-field/ui/meta-types/input/utils/isDoubleTextFieldEmpty';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';

export const FullNameFieldInput = () => {
  const { t } = useLingui();
  const { draftValue, setDraftValue } = useFullNameField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const convertToFullName = (newDoubleText: FieldDoubleText) => {
    return {
      firstName: newDoubleText.firstValue.trim(),
      lastName: newDoubleText.secondValue.trim(),
    };
  };

  const getRequiredDraftValueFromDoubleText = (
    newDoubleText: FieldDoubleText,
  ) => {
    return isDoubleTextFieldEmpty(newDoubleText)
      ? undefined
      : convertToFullName(newDoubleText);
  };

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.({ newValue: convertToFullName(newDoubleText) });
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.({ newValue: convertToFullName(newDoubleText) });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.({ newValue: convertToFullName(newDoubleText), event });
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.({ newValue: convertToFullName(newDoubleText) });
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.({ newValue: convertToFullName(newDoubleText) });
  };

  const handleChange = (newDoubleText: FieldDoubleText) => {
    setDraftValue(getRequiredDraftValueFromDoubleText(newDoubleText));
  };

  const handlePaste = (newDoubleText: FieldDoubleText) => {
    setDraftValue(getRequiredDraftValueFromDoubleText(newDoubleText));
  };

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  return (
    <DoubleTextInput
      instanceId={instanceId}
      firstValue={draftValue?.firstName ?? ''}
      secondValue={draftValue?.lastName ?? ''}
      firstValuePlaceholder={addCharactersToAvoidPasswordManagers(
        t`First name`,
      )}
      secondValuePlaceholder={addCharactersToAvoidPasswordManagers(
        t`Last name`,
      )}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      onPaste={handlePaste}
      onChange={handleChange}
    />
  );
};
