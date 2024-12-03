import styled from '@emotion/styled';
import { FocusEventHandler, useId } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { RGBA } from 'twenty-ui';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { InputHotkeyScope } from '../types/InputHotkeyScope';

const MAX_ROWS = 5;

export type TextAreaProps = {
  label?: string;
  disabled?: boolean;
  minRows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  onBlur?: () => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTextArea = styled(TextareaAutosize)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 16px;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  resize: none;
  width: 100%;

  &:focus {
    outline: none;
    ${({ theme }) => {
      return `box-shadow: 0px 0px 0px 3px ${RGBA(theme.color.blue, 0.1)};
      border-color: ${theme.color.blue};`;
    }};
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.regular};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export const TextArea = ({
  label,
  disabled,
  placeholder,
  minRows = 1,
  value = '',
  className,
  onChange,
  onBlur,
}: TextAreaProps) => {
  const computedMinRows = Math.min(minRows, MAX_ROWS);

  const inputId = useId();

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = () => {
    setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    goBackToPreviousHotkeyScope();
    onBlur?.();
  };

  return (
    <StyledContainer>
      {label && <StyledLabel htmlFor={inputId}>{label}</StyledLabel>}

      <StyledTextArea
        id={inputId}
        placeholder={placeholder}
        maxRows={MAX_ROWS}
        minRows={computedMinRows}
        value={value}
        onChange={(event) =>
          onChange?.(turnIntoEmptyStringIfWhitespacesOnly(event.target.value))
        }
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={className}
      />
    </StyledContainer>
  );
};
