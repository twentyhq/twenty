import { TextInput } from '@/ui/field/input/components/TextInput';

import { FieldInputOverlay } from '../../../../../ui/field/input/components/FieldInputOverlay';
import { usePersistField } from '../../../hooks/usePersistField';
import { useEmailField } from '../../hooks/useEmailField';

import { FieldInputEvent } from './DateFieldInput';

export type EmailFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const EmailFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: EmailFieldInputProps) => {
  const { fieldDefinition, draftValue, setDraftValue, hotkeyScope } =
    useEmailField();

  const persistField = usePersistField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistField(newText));
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  return (
    <FieldInputOverlay>
      <TextInput
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
    </FieldInputOverlay>
  );
};
