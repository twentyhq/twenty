import {
  ChangeEvent,
  FocusEventHandler,
  InputHTMLAttributes,
  useRef,
  useState,
} from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { IconAlertCircle } from '@/ui/icon';
import { IconEye, IconEyeOff } from '@/ui/icon/index';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { InputHotkeyScope } from '../types/InputHotkeyScope';

type OwnProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label?: string;
  onChange?: (text: string) => void;
  fullWidth?: boolean;
  disableHotkeys?: boolean;
  error?: string;
};

const StyledContainer = styled.div<Pick<OwnProps, 'fullWidth'>>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? `100%` : 'auto')};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: row;

  width: 100%;
`;

const StyledInput = styled.input<Pick<OwnProps, 'fullWidth'>>`
  background-color: ${({ theme }) => theme.background.tertiary};
  border: none;
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({ theme }) => theme.font.family};

  font-weight: ${({ theme }) => theme.font.weight.regular};
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};

  width: 100%;

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledTrailingIconContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTrailingIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  justify-content: center;
`;

const INPUT_TYPE_PASSWORD = 'password';

export function TextInput({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  fullWidth,
  error,
  required,
  type,
  disableHotkeys = false,
  ...props
}: OwnProps): JSX.Element {
  const theme = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    onFocus?.(e);
    if (!disableHotkeys) {
      setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e);
    if (!disableHotkeys) {
      goBackToPreviousHotkeyScope();
    }
  };

  useScopedHotkeys(
    [Key.Escape, Key.Enter],
    () => {
      inputRef.current?.blur();
    },
    InputHotkeyScope.TextInput,
  );

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <StyledContainer fullWidth={fullWidth ?? false}>
      {label && <StyledLabel>{label + (required ? '*' : '')}</StyledLabel>}
      <StyledInputContainer>
        <StyledInput
          autoComplete="off"
          ref={inputRef}
          tabIndex={props.tabIndex ?? 0}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          required={required}
          type={passwordVisible ? 'text' : type}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
              onChange(event.target.value);
            }
          }}
          {...props}
        />
        <StyledTrailingIconContainer>
          {error && (
            <StyledTrailingIcon>
              <IconAlertCircle size={16} color={theme.color.red} />
            </StyledTrailingIcon>
          )}
          {!error && type === INPUT_TYPE_PASSWORD && (
            <StyledTrailingIcon
              onClick={handleTogglePasswordVisibility}
              data-testid="reveal-password-button"
            >
              {passwordVisible ? (
                <IconEyeOff size={theme.icon.size.md} />
              ) : (
                <IconEye size={theme.icon.size.md} />
              )}
            </StyledTrailingIcon>
          )}
        </StyledTrailingIconContainer>
      </StyledInputContainer>
      {error && <StyledErrorHelper>{error}</StyledErrorHelper>}
    </StyledContainer>
  );
}
