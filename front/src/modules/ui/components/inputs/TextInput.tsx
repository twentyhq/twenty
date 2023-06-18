import { ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  initialValue: string;
  onChange: (text: string) => void;
  fullWidth?: boolean;
};

const StyledInput = styled.input<{ fullWidth: boolean }>`
  background-color: ${({ theme }) => theme.lighterBackgroundTransparent};
  border: 1px solid ${({ theme }) => theme.lightBorder};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) =>
  theme.spacing(3)};

  color: ${({ theme }) => theme.text80};
  outline: none;
  width: ${({ fullWidth, theme }) =>
    fullWidth ? `calc(100% - ${theme.spacing(6)})` : 'auto'};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.text30}
    font-family: ${({ theme }) => theme.fontFamily};;
    font-weight: ${({ theme }) => theme.fontWeightMedium};
  }
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export function TextInput({
  initialValue,
  onChange,
  fullWidth,
}: OwnProps): JSX.Element {
  const [value, setValue] = useState(initialValue);

  return (
    <StyledInput
      fullWidth={fullWidth ?? false}
      value={value}
      placeholder="Email"
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        onChange(event.target.value);
      }}
    />
  );
}
