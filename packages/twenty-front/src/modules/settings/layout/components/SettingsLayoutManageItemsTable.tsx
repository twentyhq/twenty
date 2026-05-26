import { AppChip } from '@/applications/components/AppChip';
import { type LayoutItemRow } from '@/settings/layout/types/LayoutItemRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SecondaryColumnKind = 'object' | 'type';

type SettingsLayoutManageItemsTableProps = {
  rows: LayoutItemRow[];
  fallbackApplicationId?: string | null;
  secondaryColumn?: SecondaryColumnKind;
};

const GRID_TEMPLATE_COLUMNS_TWO = '1fr 160px 36px';
const GRID_TEMPLATE_COLUMNS_THREE = '1fr 160px 160px 36px';

const StyledNameCell = styled(TableCell)`
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
`;

const StyledNameLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
`;

const StyledSecondaryWithIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[2]};
  text-align: center;
`;

export const SettingsLayoutManageItemsTable = ({
  rows,
  fallbackApplicationId,
  secondaryColumn,
}: SettingsLayoutManageItemsTableProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const hasSecondaryColumn = isDefined(secondaryColumn);
  const gridTemplateColumns = hasSecondaryColumn
    ? GRID_TEMPLATE_COLUMNS_THREE
    : GRID_TEMPLATE_COLUMNS_TWO;

  const secondaryHeader = secondaryColumn === 'object' ? t`Object` : t`Type`;

  return (
    <Table>
      <TableRow gridTemplateColumns={gridTemplateColumns}>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`App`}</TableHeader>
        {hasSecondaryColumn && <TableHeader>{secondaryHeader}</TableHeader>}
        <TableHeader />
      </TableRow>
      {rows.length === 0 ? (
        <StyledEmptyState>{t`No items match your search.`}</StyledEmptyState>
      ) : (
        rows.map((row) => {
          const NameIcon = getIcon(row.icon);
          const SecondaryIcon =
            row.secondary?.kind === 'object'
              ? getIcon(row.secondary.icon)
              : undefined;

          return (
            <TableRow
              key={row.id}
              gridTemplateColumns={gridTemplateColumns}
              isClickable={isDefined(row.to)}
              to={row.to}
            >
              <StyledNameCell>
                <NameIcon
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                  color={theme.font.color.tertiary}
                />
                <StyledNameLabel>
                  <OverflowingTextWithTooltip text={row.name} />
                </StyledNameLabel>
              </StyledNameCell>
              <TableCell>
                <AppChip
                  applicationId={row.applicationId ?? fallbackApplicationId}
                />
              </TableCell>
              {hasSecondaryColumn && (
                <TableCell>
                  {isDefined(row.secondary) && (
                    <StyledSecondaryWithIcon>
                      {isDefined(SecondaryIcon) && (
                        <SecondaryIcon
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                          color={theme.font.color.tertiary}
                        />
                      )}
                      <OverflowingTextWithTooltip text={row.secondary.label} />
                    </StyledSecondaryWithIcon>
                  )}
                </TableCell>
              )}
              <TableCell align="right">
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                  color={theme.font.color.light}
                />
              </TableCell>
            </TableRow>
          );
        })
      )}
    </Table>
  );
};
