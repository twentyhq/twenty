import { FieldDoubleText } from '../../../types/FieldDoubleText';
import { useLinkField } from '../../hooks/useLinkField';

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
  const { initialValue, hotkeyScope, persistLinkField } = useLinkField();

  const handleEnter = (newURL: FieldDoubleText) => {
    onEnter?.(() =>
      persistLinkField({
        url: newURL.firstValue,
        label: newURL.secondValue,
      }),
    );
  };

  const handleEscape = (newURL: FieldDoubleText) => {
    onEscape?.(() =>
      persistLinkField({
        url: newURL.firstValue,
        label: newURL.secondValue,
      }),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newURL: FieldDoubleText,
  ) => {
    onClickOutside?.(() =>
      persistLinkField({
        url: newURL.firstValue,
        label: newURL.secondValue,
      }),
    );
  };

  const handleTab = (newURL: FieldDoubleText) => {
    onTab?.(() =>
      persistLinkField({
        url: newURL.firstValue,
        label: newURL.secondValue,
      }),
    );
  };

  const handleShiftTab = (newURL: FieldDoubleText) => {
    onShiftTab?.(() =>
      persistLinkField({
        url: newURL.firstValue,
        label: newURL.secondValue,
      }),
    );
  };

  return (
    <FieldInputOverlay>
      <DoubleTextInput
        firstValue={initialValue.url}
        secondValue={initialValue.label}
        firstValuePlaceholder={'Url'}
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
