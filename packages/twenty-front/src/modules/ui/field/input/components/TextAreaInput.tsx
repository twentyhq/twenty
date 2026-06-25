import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledTextAreaContainer = styled.div`
  > textarea {
    align-items: center;
    background-color: transparent;
    border: none;
    color: ${themeCssVariables.font.color.primary};
    display: flex;
    font-family: ${themeCssVariables.font.family};
    font-size: inherit;
    font-weight: inherit;

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${themeCssVariables.font.color.light};
      font-family: ${themeCssVariables.font.family};
      font-weight: ${themeCssVariables.font.weight.medium};
    }

    justify-content: center;
    line-height: 18px;
    max-height: 400px;
    outline: none;
    padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
    resize: none;

    width: calc(100% - ${themeCssVariables.spacing[7]});
  }
`;

const StyledLightIconButtonContainer = styled.div`
  background: transparent;
  position: absolute;
  right: 0;
  top: 16px;
  transform: translateY(-50%);
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
      <StyledTextAreaContainer>
        <TextareaAutosize
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          ref={wrapperRef}
          onChange={handleChange}
          autoFocus={autoFocus}
          value={internalText}
          maxRows={maxRows}
        />
      </StyledTextAreaContainer>
      {copyButton && (
        <StyledLightIconButtonContainer ref={copyRef}>
          <LightCopyIconButton copyText={internalText} />
        </StyledLightIconButtonContainer>
      )}
    </>
  );
};
