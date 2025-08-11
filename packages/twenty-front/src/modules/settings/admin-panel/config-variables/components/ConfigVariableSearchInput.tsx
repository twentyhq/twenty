import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/display';

const StyledSearchInput = styled(SettingsTextInput)`
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
      instanceId="config-variable-search"
      placeholder={t`Search config variables`}
      value={value}
      onChange={onChange}
      autoFocus={false}
      LeftIcon={IconSearch}
    />
  );
};
