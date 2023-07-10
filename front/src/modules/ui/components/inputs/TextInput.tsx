import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

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
  return (
    <StyledContainer>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInput
        fullWidth={fullWidth ?? false}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (onChange) {
            onChange(event.target.value);
          }
        }}
        {...props}
      />
    </StyledContainer>
  );
}
