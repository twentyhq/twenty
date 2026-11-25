import { SearchInput } from 'twenty-ui/components/input';
import { useLingui } from '@lingui/react/macro';

type ConfigVariableSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ConfigVariableSearchInput = ({
  value,
  onChange,
}: ConfigVariableSearchInputProps) => {
  const { t } = useLingui();
  return (
    <SearchInput
      placeholder={t`Search config variables`}
      value={value}
      onValueChange={onChange}
    />
  );
};
