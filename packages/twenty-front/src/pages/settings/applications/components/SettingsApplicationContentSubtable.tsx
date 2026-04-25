import {
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type ApplicationContentRow = {
  key: string;
  name: string;
  icon?: string;
  secondary?: string;
  link?: string;
};

const GRID_TEMPLATE_COLUMNS = '1fr auto 32px';

export const SettingsApplicationContentSubtable = ({
  title,
  rows,
}: {
  title: string;
  rows: ApplicationContentRow[];
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  if (rows.length === 0) {
    return null;
  }

  return (
    <TableSection title={title}>
      {rows.map((row) => {
        const Icon = getIcon(row.icon);

        return (
          <TableRow
            key={row.key}
            gridAutoColumns={GRID_TEMPLATE_COLUMNS}
            to={row.link}
          >
            <StyledNameTableCell minWidth="0" overflow="hidden">
              {isDefined(Icon) && (
                <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              )}
              <OverflowingTextWithTooltip text={row.name} />
            </StyledNameTableCell>
            <TableCell
              align="right"
              color={themeCssVariables.font.color.secondary}
              minWidth="0"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              {isDefined(row.secondary) && (
                <OverflowingTextWithTooltip text={row.secondary} />
              )}
            </TableCell>
            <StyledActionTableCell>
              {isDefined(row.link) && (
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                  color={theme.font.color.light}
                />
              )}
            </StyledActionTableCell>
          </TableRow>
        );
      })}
    </TableSection>
  );
};
