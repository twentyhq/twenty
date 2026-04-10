import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  OverflowingTextWithTooltip,
  type IconComponent,
} from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type TableItem = {
  Icon?: IconComponent;
  label: string;
  value: string | number | React.ReactNode;
  onClick?: () => void;
};

const StyledTableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsTableCardProps = {
  items: TableItem[];
  rounded?: boolean;
  gridAutoColumns?: string;
  labelAlign?: 'left' | 'center' | 'right';
  valueAlign?: 'left' | 'center' | 'right';
  className?: string;
};

export const SettingsTableCard = ({
  items,
  rounded = false,
  gridAutoColumns,
  labelAlign = 'left',
  valueAlign = 'left',
  className,
}: SettingsTableCardProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Card
      rounded={rounded}
      className={className}
      backgroundColor={themeCssVariables.background.secondary}
    >
      <Table>
        <StyledTableBody>
          {items.map((item, index) => (
            <TableRow
              key={index + item.label}
              gridAutoColumns={gridAutoColumns}
              height={`${themeCssVariables.spacing[7]}px`}
            >
              <TableCell
                align={labelAlign}
                color={themeCssVariables.font.color.tertiary}
                height="auto"
                gap={themeCssVariables.spacing[2]}
                overflow="hidden"
              >
                {item.Icon && <item.Icon size={theme.icon.size.md} />}
                <OverflowingTextWithTooltip text={item.label} />
              </TableCell>
              <TableCell
                align={valueAlign}
                color={themeCssVariables.font.color.primary}
                height="auto"
                onClick={item.onClick}
                clickable={isDefined(item.onClick)}
              >
                {item.value}
              </TableCell>
            </TableRow>
          ))}
        </StyledTableBody>
      </Table>
    </Card>
  );
};
