import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledTextInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  margin: 0;
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  width: 100%;

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

export type TextInputProps = {
  instanceId: string;
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onEnter?: (newText: string) => void;
  onEscape?: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside?: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  onChange?: (newText: string) => void;
  copyButton?: boolean;
  shouldTrim?: boolean;
  disabled?: boolean;
  className?: string;
};

const getValue = (value: string, shouldTrim: boolean) => {
  if (shouldTrim) {
    return value.trim();
  }

  return value;
};

export const TextInput = ({
  instanceId,
  placeholder,
  autoFocus,
  value,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  onChange,
  copyButton = true,
  shouldTrim = true,
  disabled,
  className,
}: TextInputProps) => {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef<HTMLInputElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(getValue(event.target.value, shouldTrim));
    onChange?.(getValue(event.target.value, shouldTrim));
  };
  useEffect(() => {
    setInternalText(getValue(value, shouldTrim));
  }, [value, shouldTrim]);

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: wrapperRef,
    copyRef: copyRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
  });

  return (
    <>
      <StyledTextInput
        id={instanceId}
        autoComplete="off"
        ref={wrapperRef}
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        value={internalText}
        disabled={disabled}
        className={className}
      />
      {copyButton && (
        <div ref={copyRef}>
          <LightCopyIconButton copyText={internalText} />
        </div>
      )}
    </>
  );
};
