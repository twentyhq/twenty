import { Box, Text, useStyleConfig } from '@chakra-ui/react';

import { MatchColumnSelect } from '../../../components/Selects/MatchColumnSelect';
import { useRsi } from '../../../hooks/useRsi';
import type {
  MatchedOptions,
  MatchedSelectColumn,
  MatchedSelectOptionsColumn,
} from '../MatchColumnsStep';
import { getFieldOptions } from '../utils/getFieldOptions';

import type { Styles } from './ColumnGrid';

interface Props<T> {
  option: MatchedOptions<T> | Partial<MatchedOptions<T>>;
  column: MatchedSelectColumn<T> | MatchedSelectOptionsColumn<T>;
  onSubChange: (val: T, index: number, option: string) => void;
}

export const SubMatchingSelect = <T extends string>({
  option,
  column,
  onSubChange,
}: Props<T>) => {
  const styles = useStyleConfig('MatchColumnsStep') as Styles;
  const { translations, fields } = useRsi<T>();
  const options = getFieldOptions(fields, column.value);
  const value = options.find((opt) => opt.value == option.value);

  return (
    <Box pl={2} pb="0.375rem">
      <Text sx={styles.selectColumn.selectLabel}>{option.entry}</Text>
      <MatchColumnSelect
        value={value}
        placeholder={translations.matchColumnsStep.subSelectPlaceholder}
        onChange={(value) =>
          onSubChange(value?.value as T, column.index, option.entry!)
        }
        options={options}
        name={option.entry}
      />
    </Box>
  );
};
