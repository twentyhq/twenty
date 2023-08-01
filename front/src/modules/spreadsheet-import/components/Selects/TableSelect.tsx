import { useStyleConfig } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';

import type { themeOverrides } from '../../theme';
import type { SelectOption } from '../../types';
import { rootId } from '../Providers';

interface Props {
  onChange: (value: SelectOption | null) => void;
  value?: SelectOption;
  options: readonly SelectOption[];
}

export const TableSelect = ({ onChange, value, options }: Props) => {
  const styles = useStyleConfig(
    'ValidationStep',
  ) as (typeof themeOverrides)['components']['ValidationStep']['baseStyle'];
  return (
    <Select<SelectOption, false>
      autoFocus
      size="sm"
      value={value}
      onChange={onChange}
      placeholder=" "
      closeMenuOnScroll
      menuPosition="fixed"
      menuIsOpen
      menuPortalTarget={document.getElementById(rootId)}
      options={options}
      chakraStyles={styles.select}
    />
  );
};
