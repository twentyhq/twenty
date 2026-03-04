import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled(Card)`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTableRow = styled(TableRow)`
  height: ${themeCssVariables.spacing[6]};
`;

const StyledTableCellLabel = styled(TableCell)<{
  align?: 'left' | 'center' | 'right';
}>`
  color: ${themeCssVariables.font.color.tertiary};
  height: ${themeCssVariables.spacing[6]};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
`;

const StyledTableCellValue = styled(TableCell)<{
  align?: 'left' | 'center' | 'right';
  clickable?: boolean;
}>`
  color: ${themeCssVariables.font.color.primary};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  height: ${themeCssVariables.spacing[6]};
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
  onClick?: () => void;
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
  const { theme } = useContext(ThemeContext);

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
              <StyledTableCellValue
                align={valueAlign}
                onClick={item.onClick}
                clickable={isDefined(item.onClick)}
              >
                {item.value}
              </StyledTableCellValue>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledCard>
  );
};
