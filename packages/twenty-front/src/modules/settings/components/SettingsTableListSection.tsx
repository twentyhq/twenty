import { type ComponentType, type ReactNode } from 'react';

import { styled } from '@linaria/react';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledRowWrapper = styled.div<{ clickable: boolean }>`
  ${({ clickable }) =>
    clickable
      ? `
        > * {
          &:hover {
            background-color: ${themeCssVariables.background.transparent.light};
            cursor: pointer;
          }
        }
      `
      : ''}
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const HEADER_PADDING = `0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[2]}`;

export type SettingsTableListSectionColumn<Item> = {
  label: string;
  align?: 'left' | 'right';
  Cell: ComponentType<{ item: Item }>;
};

type SettingsTableListSectionProps<Item extends { id: string }> = {
  title: string;
  description: string;
  headerAdornment?: ReactNode;
  items: Item[];
  columns: SettingsTableListSectionColumn<Item>[];
  gridAutoColumns: string;
  showRowChevron?: boolean;
  onRowClick?: (item: Item) => void;
  footerButtonLabel: string;
  onFooterButtonClick: () => void;
};

export const SettingsTableListSection = <
  Item extends { id: string } = { id: string },
>({
  title,
  description,
  headerAdornment,
  items,
  columns,
  gridAutoColumns,
  showRowChevron = false,
  onRowClick,
  footerButtonLabel,
  onFooterButtonClick,
}: SettingsTableListSectionProps<Item>) => {
  const resolvedGridAutoColumns = showRowChevron
    ? `${gridAutoColumns} auto`
    : gridAutoColumns;

  return (
    <Section>
      <H2Title
        title={title}
        description={description}
        adornment={headerAdornment}
      />
      {items.length > 0 && (
        <Table>
          <TableRow gridAutoColumns={resolvedGridAutoColumns}>
            {columns.map((column) => (
              <TableHeader
                key={column.label}
                align={column.align}
                padding={HEADER_PADDING}
              >
                {column.label}
              </TableHeader>
            ))}
            {showRowChevron && <TableHeader padding={HEADER_PADDING} />}
          </TableRow>
          <StyledTableRows>
            {items.map((item) => (
              <StyledRowWrapper key={item.id} clickable={Boolean(onRowClick)}>
                <TableRow
                  gridAutoColumns={resolvedGridAutoColumns}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.label} align={column.align}>
                      <column.Cell item={item} />
                    </TableCell>
                  ))}
                  {showRowChevron && (
                    <TableCell
                      align="right"
                      color={themeCssVariables.font.color.light}
                    >
                      <IconChevronRight size={16} />
                    </TableCell>
                  )}
                </TableRow>
              </StyledRowWrapper>
            ))}
          </StyledTableRows>
        </Table>
      )}
      <StyledFooter>
        <Button
          Icon={IconPlus}
          title={footerButtonLabel}
          variant="secondary"
          size="small"
          onClick={onFooterButtonClick}
        />
      </StyledFooter>
    </Section>
  );
};
