import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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
    <Card
      rounded={rounded}
      className={className}
      backgroundColor={themeCssVariables.background.secondary}
    >
      <Table>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={index + item.label}
              gridAutoColumns={gridAutoColumns}
            >
              <TableCell
                align={labelAlign}
                color={themeCssVariables.font.color.tertiary}
                height="auto"
                gap={themeCssVariables.spacing[2]}
                padding={`${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}`}
              >
                {item.Icon && <item.Icon size={theme.icon.size.md} />}
                <span>{item.label}</span>
              </TableCell>
              <TableCell
                align={valueAlign}
                color={themeCssVariables.font.color.primary}
                height="auto"
                onClick={item.onClick}
                clickable={isDefined(item.onClick)}
                padding={`${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}`}
              >
                {item.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
