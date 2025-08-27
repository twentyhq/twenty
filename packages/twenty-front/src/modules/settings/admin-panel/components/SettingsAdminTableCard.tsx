import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Card } from 'twenty-ui/layout';
import { type IconComponent } from 'twenty-ui/display';

const StyledCard = styled(Card)`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledTableRow = styled(TableRow)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledTableCellLabel = styled(TableCell)<{
  align?: 'left' | 'center' | 'right';
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  height: ${({ theme }) => theme.spacing(6)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
`;

const StyledTableCellValue = styled(TableCell)<{
  align?: 'left' | 'center' | 'right';
}>`
  color: ${({ theme }) => theme.font.color.primary};
  height: ${({ theme }) => theme.spacing(6)};
  justify-content: ${({ align }) =>
    align === 'left'
      ? 'flex-start'
      : align === 'center'
        ? 'center'
        : 'flex-end'};
`;

type TableItem = {
  Icon?: IconComponent;
  label: string;
  value: string | number | React.ReactNode;
};

type SettingsAdminTableCardProps = {
  items: TableItem[];
  rounded?: boolean;
  gridAutoColumns?: string;
  labelAlign?: 'left' | 'center' | 'right';
  valueAlign?: 'left' | 'center' | 'right';
  className?: string;
};

export const SettingsAdminTableCard = ({
  items,
  rounded = false,
  gridAutoColumns,
  labelAlign = 'left',
  valueAlign = 'left',
  className,
}: SettingsAdminTableCardProps) => {
  const theme = useTheme();

  return (
    <StyledCard rounded={rounded} className={className}>
      <Table>
        <TableBody>
          {items.map((item, index) => (
            <StyledTableRow
              key={index + item.label}
              gridAutoColumns={gridAutoColumns}
            >
              <StyledTableCellLabel align={labelAlign}>
                {item.Icon && <item.Icon size={theme.icon.size.md} />}
                <span>{item.label}</span>
              </StyledTableCellLabel>
              <StyledTableCellValue align={valueAlign}>
                {item.value}
              </StyledTableCellValue>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledCard>
  );
};
