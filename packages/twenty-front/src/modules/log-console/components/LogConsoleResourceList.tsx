import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { SearchInput } from 'twenty-ui/components/input';
import { IconChevronRight } from 'twenty-ui/icon';
import { handleClickableElementKeyDown } from 'twenty-ui/primitives/accessibility';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { LogConsoleToolbarLayout } from '@/log-console/components/LogConsoleToolbarLayout';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const CHEVRON_COLUMN_WIDTH = '32px';

const StyledSearch = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledContent = styled.div`
  box-sizing: border-box;
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

export type LogConsoleResourceListColumn<TItem> = {
  label: string;
  width: string;
  renderCell: (item: TItem) => ReactNode;
};

type LogConsoleResourceListProps<TItem extends { id: string }> = {
  items: TItem[];
  columns: LogConsoleResourceListColumn<TItem>[];
  getSearchableValues: (item: TItem) => string[];
  searchPlaceholder: string;
  emptyLabel: string;
  actions: ReactNode;
  scrollWrapperInstanceId: string;
  selectedItemId?: string;
  onItemClick: (item: TItem) => void;
};

export const LogConsoleResourceList = <TItem extends { id: string }>({
  items,
  columns,
  getSearchableValues,
  searchPlaceholder,
  emptyLabel,
  actions,
  scrollWrapperInstanceId,
  selectedItemId,
  onItemClick,
}: LogConsoleResourceListProps<TItem>) => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = filterBySearchQuery({
    items,
    searchQuery: searchValue,
    getSearchableValues,
  });

  const gridTemplateColumns = [
    ...columns.map((column) => column.width),
    CHEVRON_COLUMN_WIDTH,
  ].join(' ');

  return (
    <>
      <LogConsoleToolbarLayout actions={actions}>
        <StyledSearch>
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
        </StyledSearch>
      </LogConsoleToolbarLayout>
      <ScrollWrapper componentInstanceId={scrollWrapperInstanceId}>
        <StyledContent>
          <Table>
            <TableRow gridTemplateColumns={gridTemplateColumns}>
              {columns.map((column) => (
                <TableHeader key={column.label}>{column.label}</TableHeader>
              ))}
              <TableHeader />
            </TableRow>
            {filteredItems.length === 0 ? (
              <SettingsEmptyPlaceholder>{emptyLabel}</SettingsEmptyPlaceholder>
            ) : (
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    gridTemplateColumns={gridTemplateColumns}
                    isSelected={item.id === selectedItemId}
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
                ))}
              </TableBody>
            )}
          </Table>
        </StyledContent>
      </ScrollWrapper>
    </>
  );
};
