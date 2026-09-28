import { type ComponentType, type ReactNode } from 'react';

import { isDefined } from 'twenty-shared/utils';

import { styled } from '@linaria/react';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Section } from 'twenty-ui/components';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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

// an auto track resolves differently in the header and in the rows, so the chevron column is fixed
const CHEVRON_COLUMN_WIDTH = themeCssVariables.spacing[8];

export type SettingsTableListSectionColumn<Item> = {
  label: string;
  align?: 'left' | 'right';
  overflow?: string;
  Cell: ComponentType<{ item: Item }>;
};

type SettingsTableListSectionProps<Item extends { id: string }> = {
  title: string;
  description: string;
  headerAdornment?: ReactNode;
  toolbar?: ReactNode;
  items: Item[];
  columns: SettingsTableListSectionColumn<Item>[];
  gridAutoColumns: string;
  showRowChevron?: boolean;
  onRowClick?: (item: Item) => void;
  footerButtonLabel?: string;
  onFooterButtonClick?: () => void;
};

export const SettingsTableListSection = <
  Item extends { id: string } = { id: string },
>({
  title,
  description,
  headerAdornment,
  toolbar,
  items,
  columns,
  gridAutoColumns,
  showRowChevron = false,
  onRowClick,
  footerButtonLabel,
  onFooterButtonClick,
}: SettingsTableListSectionProps<Item>) => {
  const resolvedGridAutoColumns = showRowChevron
    ? `${gridAutoColumns} ${CHEVRON_COLUMN_WIDTH}`
    : gridAutoColumns;

  return (
    <Section.Root>
      <Section.Header
        title={title}
        description={description}
        adornment={headerAdornment}
      />
      {isDefined(toolbar) && toolbar}
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
                    <TableCell
                      key={column.label}
                      align={column.align}
                      overflow={column.overflow}
                    >
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
      {isDefined(footerButtonLabel) && isDefined(onFooterButtonClick) && (
        <StyledFooter>
          <Button
            startIcon={<IconPlus />}
            size="sm"
            onClick={onFooterButtonClick}
            variant="outline"
          >
            {footerButtonLabel}
          </Button>
        </StyledFooter>
      )}
    </Section.Root>
  );
};
