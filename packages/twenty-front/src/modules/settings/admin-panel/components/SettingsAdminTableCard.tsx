import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Card, IconComponent } from 'twenty-ui';

const StyledCard = styled(Card)`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledTableRow = styled(TableRow)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledTableCellValue = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledTableCellLabel = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
  height: ${({ theme }) => theme.spacing(6)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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
};

export const SettingsAdminTableCard = ({
  items,
  rounded = false,
  gridAutoColumns,
}: SettingsAdminTableCardProps) => {
  const theme = useTheme();

  return (
    <StyledCard rounded={rounded}>
      <Table>
        <TableBody>
          {items.map((item, index) => (
            <StyledTableRow key={index} gridAutoColumns={gridAutoColumns}>
              <StyledTableCellLabel>
                {item.Icon && <item.Icon size={theme.icon.size.md} />}
                <span>{item.label}</span>
              </StyledTableCellLabel>
              <StyledTableCellValue>{item.value}</StyledTableCellValue>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledCard>
  );
};
