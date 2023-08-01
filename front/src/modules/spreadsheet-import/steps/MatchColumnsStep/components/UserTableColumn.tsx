import { CgClose, CgUndo } from 'react-icons/cg';
import { Box, Flex, IconButton, Text, useStyleConfig } from '@chakra-ui/react';
import { dataAttr } from '@chakra-ui/utils';

import type { RawData } from '../../../types';
import type { Column } from '../MatchColumnsStep';
import { ColumnType } from '../MatchColumnsStep';

import type { Styles } from './ColumnGrid';

type UserTableColumnProps<T extends string> = {
  column: Column<T>;
  entries: RawData;
  onIgnore: (index: number) => void;
  onRevertIgnore: (index: number) => void;
};

export const UserTableColumn = <T extends string>(
  props: UserTableColumnProps<T>,
) => {
  const styles = useStyleConfig('MatchColumnsStep') as Styles;
  const {
    column: { header, index, type },
    entries,
    onIgnore,
    onRevertIgnore,
  } = props;
  const isIgnored = type === ColumnType.ignored;
  return (
    <Box>
      <Flex px={6} justifyContent="space-between" alignItems="center" mb={4}>
        <Text sx={styles.userTable.header} data-ignored={dataAttr(isIgnored)}>
          {header}
        </Text>
        {type === ColumnType.ignored ? (
          <IconButton
            aria-label="Ignore column"
            icon={<CgUndo />}
            onClick={() => onRevertIgnore(index)}
            {...styles.userTable.ignoreButton}
          />
        ) : (
          <IconButton
            aria-label="Ignore column"
            icon={<CgClose />}
            onClick={() => onIgnore(index)}
            {...styles.userTable.ignoreButton}
          />
        )}
      </Flex>
      {entries.map((entry, index) => (
        <Text
          key={(entry || '') + index}
          sx={styles.userTable.cell}
          data-ignored={dataAttr(isIgnored)}
        >
          {entry}
        </Text>
      ))}
    </Box>
  );
};
