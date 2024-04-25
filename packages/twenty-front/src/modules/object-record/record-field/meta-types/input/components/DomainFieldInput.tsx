import { useDomainField } from '@/object-record/record-field/meta-types/hooks/useDomainField';
import { FieldInputOverlay } from '@/ui/field/input/components/FieldInputOverlay';
import { TextInput } from '@/ui/field/input/components/TextInput';

import { FieldInputEvent } from './DateTimeFieldInput';

export type DomainFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const DomainFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: DomainFieldInputProps) => {
  const { draftValue, setDraftValue, hotkeyScope, persistDomainField } =
    useDomainField();

  const handleEnter = (domain: string) => {
    onEnter?.(() =>
      persistDomainField({
        primaryLink: domain,
      }),
    );
  };

  const handleEscape = (domain: string) => {
    onEscape?.(() =>
      persistDomainField({
        primaryLink: domain,
      }),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    domain: string,
  ) => {
    onClickOutside?.(() =>
      persistDomainField({
        primaryLink: domain,
      }),
    );
  };

  const handleTab = (domain: string) => {
    onTab?.(() =>
      persistDomainField({
        primaryLink: domain,
      }),
    );
  };

  const handleShiftTab = (domain: string) => {
    onShiftTab?.(() =>
      persistDomainField({
        primaryLink: domain,
      }),
    );
  };

  const handleChange = (domain: string) => {
    setDraftValue({
      primaryLink: domain,
    });
  };

  return (
    <FieldInputOverlay>
      <TextInput
        value={draftValue?.primaryLink ?? ''}
        autoFocus
        placeholder="Domain"
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
