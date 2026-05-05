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
import { AppChip } from '@/applications/components/AppChip';

export type ApplicationContentRow = {
  key: string;
  name: string;
  applicationId?: string;
  icon?: string;
  secondary?: string;
  link?: string;
};

const GRID_TEMPLATE_COLUMNS = '200px 1fr 160px 32px';

export const SettingsApplicationContentSubtable = ({
  title,
  rows,
  applicationId,
  fallbackApplicationData,
}: {
  title: string;
  rows: ApplicationContentRow[];
  applicationId?: string;
  fallbackApplicationData?: {
    logo?: string | null;
    name?: string | null;
  };
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
            <StyledNameTableCell minWidth="0" overflow="hidden" align={'right'}>
              <AppChip
                applicationId={row.applicationId ?? applicationId}
                fallbackApplicationData={fallbackApplicationData}
              />
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
