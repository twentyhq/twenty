import { TextInput } from '@/ui/input/components/TextInput';

import { useTextField } from '../../hooks/useTextField';

type OwnProps = {
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
};

export const TextFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: OwnProps) => {
  const { fieldDefinition, fieldValue, setFieldValueForPersist, hotkeyScope } =
    useTextField();

  const handleEnter = (newText: string) => {
    setFieldValueForPersist(newText);
    onEnter?.();
  };

  const handleEscape = (newText: string) => {
    setFieldValueForPersist(newText);
    onEscape?.();
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    setFieldValueForPersist(newText);
    onClickOutside?.();
  };

  const handleTab = (newText: string) => {
    setFieldValueForPersist(newText);
    onTab?.();
  };

  const handleShiftTab = (newText: string) => {
    setFieldValueForPersist(newText);
    onShiftTab?.();
  };

  return (
    <TextInput
      placeholder={fieldDefinition.metadata.placeHolder}
      autoFocus
      value={fieldValue ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      hotkeyScope={hotkeyScope}
    />
  );
};
