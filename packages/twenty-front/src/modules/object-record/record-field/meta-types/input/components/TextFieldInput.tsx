import { FieldTextAreaOverlay } from '@/ui/field/input/components/FieldTextAreaOverlay';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useTextField } from '../../hooks/useTextField';

import { convertToEmptyStringForWhitespaces } from '~/utils/string/convertToEmptyStringForWhitespaces';
import { convertToUndefinedForWhitespaces } from '~/utils/string/convertToUndefinedForWhitespaces';
import { FieldInputEvent } from './DateTimeFieldInput';

export type TextFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const TextFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TextFieldInputProps) => {
  const { fieldDefinition, draftValue, hotkeyScope, setDraftValue } =
    useTextField();

  const persistField = usePersistField();

  const handleEnter = (newText: string) => {
    // have change like handleChange here too
    onEnter?.(() => persistField(convertToEmptyStringForWhitespaces(newText)));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistField(convertToEmptyStringForWhitespaces(newText)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() =>
      persistField(convertToEmptyStringForWhitespaces(newText)),
    );
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistField(convertToEmptyStringForWhitespaces(newText)));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() =>
      persistField(convertToEmptyStringForWhitespaces(newText)),
    );
  };

  const handleChange = (newText: string) => {
    setDraftValue(convertToUndefinedForWhitespaces(newText));
  };

  return (
    <FieldTextAreaOverlay>
      <TextAreaInput
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={draftValue ?? ''}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        hotkeyScope={hotkeyScope}
        onChange={handleChange}
      />
    </FieldTextAreaOverlay>
  );
};
