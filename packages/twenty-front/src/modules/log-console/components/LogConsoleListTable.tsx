import { type ReactNode } from 'react';
import { IconChevronRight } from 'twenty-ui/icon';
import { handleClickableElementKeyDown } from 'twenty-ui/primitives/accessibility';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const CHEVRON_COLUMN_WIDTH = '32px';

export type LogConsoleListTableColumn<TItem> = {
  label: string;
  width: string;
  renderCell: (item: TItem) => ReactNode;
};

type LogConsoleListTableProps<TItem> = {
  columns: LogConsoleListTableColumn<TItem>[];
  items: TItem[];
  getItemId: (item: TItem) => string;
  selectedItemId?: string;
  onItemClick: (item: TItem) => void;
  emptyLabel: string;
};

export const LogConsoleListTable = <TItem,>({
  columns,
  items,
  getItemId,
  selectedItemId,
  onItemClick,
  emptyLabel,
}: LogConsoleListTableProps<TItem>) => {
  const theme = useTheme();

  const gridTemplateColumns = [
    ...columns.map((column) => column.width),
    CHEVRON_COLUMN_WIDTH,
  ].join(' ');

  return (
    <Table>
      <TableRow gridTemplateColumns={gridTemplateColumns}>
        {columns.map((column) => (
          <TableHeader key={column.label}>{column.label}</TableHeader>
        ))}
        <TableHeader />
      </TableRow>
      {items.length === 0 ? (
        <SettingsEmptyPlaceholder>{emptyLabel}</SettingsEmptyPlaceholder>
      ) : (
        <TableBody>
          {items.map((item) => {
            const itemId = getItemId(item);
            return (
              <TableRow
                key={itemId}
                gridTemplateColumns={gridTemplateColumns}
                isSelected={itemId === selectedItemId}
                onClick={() => onItemClick(item)}
                onKeyDown={handleClickableElementKeyDown}
                role="button"
                tabIndex={0}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={column.label}
                    color={
                      columnIndex === 0
                        ? themeCssVariables.font.color.primary
                        : themeCssVariables.font.color.tertiary
                    }
                    gap={themeCssVariables.spacing[2]}
                    overflow="hidden"
                    clickable
                  >
                    {column.renderCell(item)}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <IconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                    color={themeCssVariables.font.color.tertiary}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      )}
    </Table>
  );
};
