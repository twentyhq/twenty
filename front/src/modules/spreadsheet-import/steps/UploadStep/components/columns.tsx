import type { Column } from 'react-data-grid';
import { CgInfo } from 'react-icons/cg';
import { Box, Tooltip } from '@chakra-ui/react';

import type { Fields } from '../../../types';

export const generateColumns = <T extends string>(fields: Fields<T>) =>
  fields.map(
    (column): Column<any> => ({
      key: column.key,
      name: column.label,
      minWidth: 150,
      headerRenderer: () => (
        <Box display="flex" gap={1} alignItems="center" position="relative">
          <Box flex={1} overflow="hidden" textOverflow="ellipsis">
            {column.label}
          </Box>
          {column.description && (
            <Tooltip placement="top" hasArrow label={column.description}>
              <Box flex={'0 0 auto'}>
                <CgInfo size="1rem" />
              </Box>
            </Tooltip>
          )}
        </Box>
      ),
      formatter: ({ row }) => (
        <Box
          minWidth="100%"
          minHeight="100%"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {row[column.key]}
        </Box>
      ),
    }),
  );
