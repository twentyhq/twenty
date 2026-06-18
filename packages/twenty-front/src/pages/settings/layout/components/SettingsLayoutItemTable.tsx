import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type ReactNode } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type Column = {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
};

type Row = {
  key: string;
  cells: ReactNode[];
};

export const SettingsLayoutItemTable = ({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description?: string;
  columns: Column[];
  rows: Row[];
}) => {
  if (rows.length === 0) {
    return null;
  }

  const gridTemplate = columns.map((c) => c.width ?? '1fr').join(' ');

  return (
    <Section>
      <H2Title title={title} description={description} />
      <Table>
        <TableRow gridTemplateColumns={gridTemplate}>
          {columns.map((col) => (
            <TableHeader key={col.key} align={col.align ?? 'left'}>
              {col.label}
            </TableHeader>
          ))}
        </TableRow>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} gridTemplateColumns={gridTemplate}>
              {row.cells.map((cell, index) => (
                <TableCell
                  key={columns[index]?.key ?? index}
                  align={columns[index]?.align ?? 'left'}
                  color={themeCssVariables.font.color.primary}
                  minWidth="0"
                  overflow="hidden"
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
};
