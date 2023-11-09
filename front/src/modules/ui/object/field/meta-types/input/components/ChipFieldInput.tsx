import { TextInput } from '@/ui/object/field/meta-types/input/components/internal/TextInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useChipField } from '../../hooks/useChipField';

import { FieldInputOverlay } from './internal/FieldInputOverlay';
import { FieldInputEvent } from './DateFieldInput';

export type ChipFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const ChipFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: ChipFieldInputProps) => {
  const { fieldDefinition, initialContentValue, hotkeyScope } = useChipField();

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

  return (
    <FieldInputOverlay>
      <TextInput
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={initialContentValue}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        hotkeyScope={hotkeyScope}
      />
    </FieldInputOverlay>
  );
};
