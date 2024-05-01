import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { FieldInputOverlay } from '@/ui/field/input/components/FieldInputOverlay';
import { TextInput } from '@/ui/field/input/components/TextInput';

import { FieldInputEvent } from './DateTimeFieldInput';

export type LinksFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const LinksFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: LinksFieldInputProps) => {
  const { draftValue, setDraftValue, hotkeyScope, persistLinksField } =
    useLinksField();

  const handleEnter = (url: string) => {
    onEnter?.(() =>
      persistLinksField({
        primaryLinkUrl: url,
        primaryLinkLabel: '',
        secondaryLinks: [],
      }),
    );
  };

  const handleEscape = (url: string) => {
    onEscape?.(() =>
      persistLinksField({
        primaryLinkUrl: url,
        primaryLinkLabel: '',
        secondaryLinks: [],
      }),
    );
  };

  const handleClickOutside = (event: MouseEvent | TouchEvent, url: string) => {
    onClickOutside?.(() =>
      persistLinksField({
        primaryLinkUrl: url,
        primaryLinkLabel: '',
        secondaryLinks: [],
      }),
    );
  };

  const handleTab = (url: string) => {
    onTab?.(() =>
      persistLinksField({
        primaryLinkUrl: url,
        primaryLinkLabel: '',
        secondaryLinks: [],
      }),
    );
  };

  const handleShiftTab = (url: string) => {
    onShiftTab?.(() =>
      persistLinksField({
        primaryLinkUrl: url,
        primaryLinkLabel: '',
        secondaryLinks: [],
      }),
    );
  };

  const handleChange = (url: string) => {
    setDraftValue({
      primaryLinkUrl: url,
      primaryLinkLabel: '',
      secondaryLinks: [],
    });
  };

  return (
    <FieldInputOverlay>
      <TextInput
        value={draftValue?.primaryLinkUrl ?? ''}
        autoFocus
        placeholder="Links"
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
