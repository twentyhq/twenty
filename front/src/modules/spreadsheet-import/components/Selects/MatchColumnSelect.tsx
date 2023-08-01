import { useStyleConfig } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';

import type { Styles } from '../../steps/MatchColumnsStep/components/ColumnGrid';
import type { SelectOption } from '../../types';

import { customComponents } from './MenuPortal';
interface Props {
  onChange: (value: SelectOption | null) => void;
  value?: SelectOption;
  options: readonly SelectOption[];
  placeholder?: string;
  name?: string;
}

export const MatchColumnSelect = ({
  onChange,
  value,
  options,
  placeholder,
  name,
}: Props) => {
  const styles = useStyleConfig('MatchColumnsStep') as Styles;
  return (
    <Select<SelectOption, false>
      value={value || null}
      colorScheme="gray"
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      chakraStyles={styles.select}
      menuPosition="fixed"
      components={customComponents}
      aria-label={name}
    />
  );
};
