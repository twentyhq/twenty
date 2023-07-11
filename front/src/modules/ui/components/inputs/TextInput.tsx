import { ChangeEvent, FocusEventHandler, useMemo, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconAlertCircle } from '@tabler/icons-react';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { usePreviousHotkeysScope } from '@/hotkeys/hooks/internal/usePreviousHotkeysScope';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { rgba } from '@/ui/themes/colors';

type OwnProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  label?: string;
  onChange?: (text: string) => void;
  fullWidth?: boolean;
  error?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledInputContainer = styled.div`
  position: relative;
`;

const StyledInput = styled.input<Pick<OwnProps, 'fullWidth'>>`
  background-color: ${({ theme }) => theme.background.tertiary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  width: ${({ fullWidth, theme }) =>
    fullWidth ? `calc(100% - ${theme.spacing(4)})` : 'auto'};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledErrorContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => rgba(theme.color.red, 0.9)};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.color.gray0};

  opacity: 1;
  padding: 8px;
`;

export function TextInput({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  fullWidth,
  error,
  required,
  ...props
}: OwnProps): JSX.Element {
  const id = useMemo(() => v4(), []);

  const theme = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    goBackToPreviousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
  } = usePreviousHotkeysScope();

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    onFocus?.(e);
    setHotkeysScopeAndMemorizePreviousScope(InternalHotkeysScope.TextInput);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e);
    goBackToPreviousHotkeysScope();
  };

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    () => {
      inputRef.current?.blur();
    },
    InternalHotkeysScope.TextInput,
  );

  return (
    <StyledContainer>
      {label && <StyledLabel>{label + (required ? '*' : '')}</StyledLabel>}
      <StyledInputContainer>
        <StyledInput
          ref={inputRef}
          tabIndex={props.tabIndex ?? 0}
          onFocus={handleFocus}
          onBlur={handleBlur}
          fullWidth={fullWidth ?? false}
          value={value}
          required={required}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
              onChange(event.target.value);
            }
          }}
          {...props}
        />
        {error && (
          <StyledErrorContainer>
            <IconAlertCircle
              id={`id-${id}`}
              size={16}
              color={theme.color.red}
            />
            <StyledTooltip anchorSelect={`#id-${id}`} content={error} noArrow />
          </StyledErrorContainer>
        )}
      </StyledInputContainer>
    </StyledContainer>
  );
}
