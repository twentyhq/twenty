import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { styled } from '@linaria/react';
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

const StyledNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

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
            <TableCell
              color={themeCssVariables.font.color.primary}
              minWidth="0"
              overflow="hidden"
            >
              <StyledNameCell>
                {isDefined(Icon) && (
                  <Icon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                )}
                <OverflowingTextWithTooltip text={row.name} />
              </StyledNameCell>
            </TableCell>
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
            <TableCell
              align="center"
              color={themeCssVariables.font.color.light}
              padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
            >
              {isDefined(row.link) && (
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </TableSection>
  );
};
