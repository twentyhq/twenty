import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { FC } from 'react';
import { IconSearch } from 'twenty-ui/display';

const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

interface ConfigVariableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ConfigVariableSearchInput: FC<ConfigVariableSearchInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <StyledSearchInput
      placeholder="Search environment variables"
      value={value}
      onChange={onChange}
      autoFocus={false}
      LeftIcon={IconSearch}
    />
  );
};
