import { type ClipboardEvent, type KeyboardEvent, useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useNumberField } from '@/object-record/record-field/ui/meta-types/hooks/useNumberField';
import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { StyledFieldInputSuffix } from '@/ui/field/input/components/StyledFieldInputSuffix';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const NumberFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useNumberField();
  const isPercentage = fieldDefinition.metadata.settings?.type === 'percentage';

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const getFieldInputEventArgs = (newValue: string) => {
    const persistResult = getNumberValueToPersist({
      newValue,
      numberType: fieldDefinition.metadata.settings?.type,
    });

    return persistResult.success
      ? { newValue: persistResult.value, skipPersist: false }
      : { skipPersist: true };
  };

  const handleEnter = (newText: string) => {
    onEnter?.(getFieldInputEventArgs(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(getFieldInputEventArgs(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.({
      ...getFieldInputEventArgs(newText),
      event,
    });
  };

  const handleTab = (newText: string) => {
    onTab?.(getFieldInputEventArgs(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(getFieldInputEventArgs(newText));
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isPercentage && event.key === '%') {
      event.preventDefault();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const input = event.target;
    const pastedText = event.clipboardData.getData('text').trim();

    if (
      !isPercentage ||
      !(input instanceof HTMLInputElement) ||
      !pastedText.endsWith('%')
    ) {
      return;
    }

    event.preventDefault();

    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? input.value.length;

    setDraftValue(
      input.value.slice(0, selectionStart) +
        pastedText.slice(0, -1).trim() +
        input.value.slice(selectionEnd),
    );
  };

  return (
    <FieldInputContainer onKeyDown={handleKeyDown} onPaste={handlePaste}>
      <TextInput
        instanceId={instanceId}
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={draftValue?.toString() ?? ''}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        onChange={handleChange}
        copyButton={!isPercentage}
      />
      {isPercentage && (
        <StyledFieldInputSuffix
          data-globally-prevent-click-outside="true"
          onMouseDown={(event) => event.preventDefault()}
        >
          {doNotTranslate('%')}
        </StyledFieldInputSuffix>
      )}
    </FieldInputContainer>
  );
};
