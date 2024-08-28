import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconSearch } from 'twenty-ui';

const StyledSearchInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: 100%;
`;

const StyledSearchInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  outline: none;
  height: 32px;
  padding: 0 8px 0 32px;
  box-sizing: border-box;
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledSearchIcon = styled(IconSearch)`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.font.color.light};
`;

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({
  placeholder,
  value,
  onChange,
}: SearchInputProps) => {
  const theme = useTheme();
  return (
    <StyledSearchInputContainer>
      <StyledSearchIcon size={theme.icon.size.md} />
      <StyledSearchInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </StyledSearchInputContainer>
  );
};
