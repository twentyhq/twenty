import { type ComponentType } from 'react';

import { styled } from '@linaria/react';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { H2Title, IconPlus } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Section } from 'twenty-ui-deprecated/layout';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

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
  items: Item[];
  columns: SettingsTableListSectionColumn<Item>[];
  gridAutoColumns: string;
  onRowClick?: (item: Item) => void;
  footerButtonLabel: string;
  onFooterButtonClick: () => void;
};

export const SettingsTableListSection = <
  Item extends { id: string } = { id: string },
>({
  title,
  description,
  items,
  columns,
  gridAutoColumns,
  onRowClick,
  footerButtonLabel,
  onFooterButtonClick,
}: SettingsTableListSectionProps<Item>) => (
  <Section>
    <H2Title title={title} description={description} />
    {items.length > 0 && (
      <Table>
        <TableRow gridAutoColumns={gridAutoColumns}>
          {columns.map((column) => (
            <TableHeader
              key={column.label}
              align={column.align}
              padding={HEADER_PADDING}
            >
              {column.label}
            </TableHeader>
          ))}
        </TableRow>
        <StyledTableRows>
          {items.map((item) => (
            <StyledRowWrapper key={item.id} clickable={Boolean(onRowClick)}>
              <TableRow
                gridAutoColumns={gridAutoColumns}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.label} align={column.align}>
                    <column.Cell item={item} />
                  </TableCell>
                ))}
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
