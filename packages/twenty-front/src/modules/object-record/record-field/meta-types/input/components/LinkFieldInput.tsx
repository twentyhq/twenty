import { TextInput } from '@/ui/field/input/components/TextInput';

import { FieldInputOverlay } from '../../../../../ui/field/input/components/FieldInputOverlay';
import { useLinkField } from '../../hooks/useLinkField';

import { FieldInputEvent } from './DateFieldInput';

export type LinkFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const LinkFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: LinkFieldInputProps) => {
  const { draftValue, setDraftValue, hotkeyScope, persistLinkField } =
    useLinkField();

  const handleEnter = (newURL: string) => {
    onEnter?.(() =>
      persistLinkField({
        url: newURL,
        label: newURL,
      }),
    );
  };

  const handleEscape = (newURL: string) => {
    onEscape?.(() =>
      persistLinkField({
        url: newURL,
        label: newURL,
      }),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newURL: string,
  ) => {
    onClickOutside?.(() =>
      persistLinkField({
        url: newURL,
        label: newURL,
      }),
    );
  };

  const handleTab = (newURL: string) => {
    onTab?.(() =>
      persistLinkField({
        url: newURL,
        label: newURL,
      }),
    );
  };

  const handleShiftTab = (newURL: string) => {
    onShiftTab?.(() =>
      persistLinkField({
        url: newURL,
        label: newURL,
      }),
    );
  };

  const handleChange = (newURL: string) => {
    setDraftValue({
      url: newURL,
      label: newURL,
    });
  };

  return (
    <FieldInputOverlay>
      <TextInput
        value={draftValue?.url ?? ''}
        autoFocus
        placeholder="URL"
        hotkeyScope={hotkeyScope}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onChange={handleChange}
      />
    </FieldInputOverlay>
  );
};
