import { t } from '@lingui/core/macro';
import { SearchInput } from 'twenty-ui/input';

type ConfigVariableSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ConfigVariableSearchInput = ({
  value,
  onChange,
}: ConfigVariableSearchInputProps) => {
  return (
    <SearchInput
      placeholder={t`Search config variables`}
      value={value}
      onChange={onChange}
    />
  );
};
