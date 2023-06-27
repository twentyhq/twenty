import { ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';

type OwnProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  onChange?: (text: string) => void;
  fullWidth?: boolean;
};

const StyledInput = styled.input<{ fullWidth: boolean }>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) =>
  theme.spacing(3)};

  color: ${({ theme }) => theme.font.color.primary};
  outline: none;
  width: ${({ fullWidth, theme }) =>
    fullWidth ? `calc(100% - ${theme.spacing(6)})` : 'auto'};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.font.color.light}
    font-family: ${({ theme }) => theme.font.family};;
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export function TextInput({
  value,
  onChange,
  fullWidth,
  ...props
}: OwnProps): JSX.Element {
  const [internalValue, setInternalValue] = useState(value);

  return (
    <StyledInput
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
  );
}
