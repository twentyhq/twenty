import styled from '@emotion/styled';
import React, { useId } from 'react';

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? `100%` : 'auto')};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.color.gray30};
  border-radius: 4px;
  padding: 8px;
`;

const StyledIcon = styled.span`
  margin-right: 8px;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-family: Arial, sans-serif;
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: 12px;
  padding: 5px 0;
`;

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  fullWidth,
  error,
  placeholder,
  icon,
}) => {
  const inputId = useId();

  return (
    <StyledContainer fullWidth={fullWidth}>
      {label && <StyledLabel htmlFor={inputId}>{label}</StyledLabel>}
      <StyledInputContainer>
        {icon && <StyledIcon>{icon}</StyledIcon>}
        <StyledInput
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </StyledInputContainer>
      {error && <StyledErrorHelper>{error}</StyledErrorHelper>}
    </StyledContainer>
  );
};

export { TextInput };
