import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/display';

const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

type ConfigVariableSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ConfigVariableSearchInput = ({
  value,
  onChange,
}: ConfigVariableSearchInputProps) => {
  return (
    <StyledSearchInput
      placeholder={t`Search config variables`}
      value={value}
      onChange={onChange}
      autoFocus={false}
      LeftIcon={IconSearch}
    />
  );
};
