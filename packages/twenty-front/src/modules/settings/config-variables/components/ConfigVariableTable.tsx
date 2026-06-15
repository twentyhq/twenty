import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { t } from '@lingui/core/macro';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { useContext } from 'react';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const GRID_AUTO_COLUMNS = '5fr 3fr 3fr 1fr';

type ConfigVariable = {
  name: string;
  description?: string;
  value?: string | React.ReactNode;
  to: string;
};

type ConfigVariableTableProps = { configVariables: ConfigVariable[] };

export const ConfigVariableTable = ({
  configVariables,
}: ConfigVariableTableProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <Table>
      <TableRow gridAutoColumns={GRID_AUTO_COLUMNS}>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader align="right">{t`Description`}</TableHeader>
        <TableHeader align="right">{t`Value`}</TableHeader>
        <TableHeader align="right"></TableHeader>
      </TableRow>
      <StyledTableBodyContainer>
        <TableBody>
          {configVariables.map((variable, index) => (
            <TableRow
              key={index}
              gridAutoColumns={GRID_AUTO_COLUMNS}
              to={variable.to}
            >
              <TableCell
                color={theme.font.color.primary}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                clickable
              >
                <OverflowingTextWithTooltip text={variable.name} />
              </TableCell>
              <TableCell
                color={theme.font.color.secondary}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                clickable
              >
                <OverflowingTextWithTooltip text={variable.description} />
              </TableCell>
              <TableCell
                color={theme.font.color.secondary}
                align="right"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                clickable
              >
                {typeof variable.value === 'string' ? (
                  <OverflowingTextWithTooltip text={variable.value} />
                ) : (
                  variable.value
                )}
              </TableCell>
              <TableCell align="right" color={theme.font.color.secondary}>
                <IconChevronRight
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
