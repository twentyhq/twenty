import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { usePreviousHotkeysScope } from '@/hotkeys/hooks/internal/usePreviousHotkeysScope';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

type OwnProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  label?: string;
  onChange?: (text: string) => void;
  fullWidth?: boolean;
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

const StyledInput = styled.input<{ fullWidth: boolean }>`
  background-color: ${({ theme }) => theme.background.tertiary};
  border: none;
  border-radius: 4px;

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

export function TextInput({
  label,
  value,
  onChange,
  fullWidth,
  ...props
}: OwnProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  const {
    goBackToPreviousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
  } = usePreviousHotkeysScope();

  function handleFocus() {
    console.log('onFocus');
    setHotkeysScopeAndMemorizePreviousScope(InternalHotkeysScope.TextInput);
  }

  function handleBlur() {
    console.log('onBlur');
    goBackToPreviousHotkeysScope();
  }

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    () => {
      inputRef.current?.blur();
    },
    InternalHotkeysScope.TextInput,
  );

  return (
    <StyledContainer>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInput
        ref={inputRef}
        tabIndex={props.tabIndex ?? 0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth={fullWidth ?? false}
        value={internalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setInternalValue(event.target.value);
          if (onChange) {
            onChange(event.target.value);
          }
        }}
        {...props}
      />
    </StyledContainer>
  );
}
