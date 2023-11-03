import { FieldDoubleText } from '../../../types/FieldDoubleText';
import { useURLV2Field } from '../../hooks/useURLV2Field';

import { DoubleTextInput } from './internal/DoubleTextInput';
import { FieldInputOverlay } from './internal/FieldInputOverlay';
import { FieldInputEvent } from './DateFieldInput';

export type URLV2FieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const URLV2FieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: URLV2FieldInputProps) => {
  const { initialValue, hotkeyScope, persistURLField } = useURLV2Field();

  const handleEnter = (newURL: FieldDoubleText) => {
    onEnter?.(() =>
      persistURLField({
        link: newURL.firstValue,
        text: newURL.secondValue,
      }),
    );
  };

  const handleEscape = (newURL: FieldDoubleText) => {
    onEscape?.(() =>
      persistURLField({
        link: newURL.firstValue,
        text: newURL.secondValue,
      }),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newURL: FieldDoubleText,
  ) => {
    onClickOutside?.(() =>
      persistURLField({
        link: newURL.firstValue,
        text: newURL.secondValue,
      }),
    );
  };

  const handleTab = (newURL: FieldDoubleText) => {
    onTab?.(() =>
      persistURLField({
        link: newURL.firstValue,
        text: newURL.secondValue,
      }),
    );
  };

  const handleShiftTab = (newURL: FieldDoubleText) => {
    onShiftTab?.(() =>
      persistURLField({
        link: newURL.firstValue,
        text: newURL.secondValue,
      }),
    );
  };

  return (
    <FieldInputOverlay>
      <DoubleTextInput
        firstValue={initialValue.link}
        secondValue={initialValue.text}
        firstValuePlaceholder={'Link'}
        secondValuePlaceholder={'Label'}
        hotkeyScope={hotkeyScope}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
      />
    </FieldInputOverlay>
  );
};
