import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type ReactNode } from 'react';
import { IconChevronRight } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

export const SETTINGS_APP_PREFERENCES_APPLICATIONS_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) auto 36px';

type SettingsAppPreferencesApplicationRowProps = {
  name: string;
  icon: ReactNode;
  type: ReactNode;
  to: string;
};

export const SettingsAppPreferencesApplicationRow = ({
  name,
  icon,
  type,
  to,
}: SettingsAppPreferencesApplicationRowProps) => {
  const theme = useTheme();

  return (
    <TableRow
      gridTemplateColumns={
        SETTINGS_APP_PREFERENCES_APPLICATIONS_GRID_TEMPLATE_COLUMNS
      }
      to={to}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        {icon}
        <OverflowingTextWithTooltip text={name} />
      </TableCell>
      <TableCell align="right">{type}</TableCell>
      <TableCell align="right" padding={`0 ${themeCssVariables.spacing[2]}`}>
        <IconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.light}
        />
      </TableCell>
    </TableRow>
  );
};
