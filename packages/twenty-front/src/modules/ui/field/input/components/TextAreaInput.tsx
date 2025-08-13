import styled from '@emotion/styled';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { isDefined } from 'twenty-shared/utils';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export type TextAreaInputProps = {
  instanceId: string;
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
  max-height: 400px;
  width: calc(100% - ${({ theme }) => theme.spacing(7)});

  line-height: 18px;
`;

const StyledLightIconButtonContainer = styled.div`
  background: transparent;
  position: absolute;
  top: 16px;
  transform: translateY(-50%);
  right: 0;
`;

export const TextAreaInput = ({
  instanceId,
  disabled,
  className,
  placeholder,
  autoFocus,
  value,
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
    const targetValue = turnIntoEmptyStringIfWhitespacesOnly(
      event.target.value,
    );
    setInternalText(targetValue);
    onChange?.(targetValue);
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
    </>
  );
};
