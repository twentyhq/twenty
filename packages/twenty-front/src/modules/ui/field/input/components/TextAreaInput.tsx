import { ChangeEvent, useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { TEXT_INPUT_STYLE } from '@/ui/theme/constants/TextInputStyle';
import { isDefined } from '~/utils/isDefined';

export type TextAreaInputProps = {
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  hotkeyScope: string;
  onChange?: (newText: string) => void;
  maxRows?: number;
  copyButton?: boolean;
};

const StyledTextArea = styled(TextareaAutosize)`
  ${TEXT_INPUT_STYLE}
  align-items: center;
  display: flex;
  justify-content: center;
  resize: none;
  width: calc(100% - ${({ theme }) => theme.spacing(7)});
`;

const StyledTextAreaContainer = styled.div`
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  position: relative;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledLightIconButtonContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
`;

export const TextAreaInput = ({
  disabled,
  className,
  placeholder,
  autoFocus,
  value,
  hotkeyScope,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  onChange,
  maxRows,
  copyButton = true,
}: TextAreaInputProps) => {
  const [internalText, setInternalText] = useState(value);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInternalText(event.target.value);
    onChange?.(event.target.value);
  };

  const wrapperRef = useRef<HTMLTextAreaElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDefined(wrapperRef.current)) {
      wrapperRef.current.setSelectionRange(
        wrapperRef.current.value.length,
        wrapperRef.current.value.length,
      );
    }
  }, []);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    copyRef: copyRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
    hotkeyScope,
  });

  return (
    <StyledTextAreaContainer>
      <StyledTextArea
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        ref={wrapperRef}
        onChange={handleChange}
        autoFocus={autoFocus}
        value={internalText}
        maxRows={maxRows}
      />
      {copyButton && (
        <StyledLightIconButtonContainer ref={copyRef}>
          <LightCopyIconButton copyText={internalText} />
        </StyledLightIconButtonContainer>
      )}
    </StyledTextAreaContainer>
  );
};
