import {
  SETTINGS_OBJECT_TABLE_COLUMN_WIDTH,
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight, useIcons } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type ApplicationDataTableRow } from '~/pages/settings/applications/types/applicationDataTableRow';
import { AppChip } from '@/applications/components/AppChip';

const MAIN_ROW_GRID_COLUMNS = `180px 1fr ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} 36px`;

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsApplicationDataTableRow = ({
  row,
}: {
  row: ApplicationDataTableRow;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const Icon = getIcon(row.icon);

  return (
    <TableRow gridAutoColumns={MAIN_ROW_GRID_COLUMNS} to={row.link}>
      <StyledNameTableCell minWidth="0" overflow="hidden">
        {isDefined(Icon) && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        <StyledNameContainer>
          <StyledNameLabel title={row.labelPlural}>
            {row.labelPlural}
          </StyledNameLabel>
        </StyledNameContainer>
      </StyledNameTableCell>
      <StyledNameTableCell minWidth="0" overflow="hidden">
        <AppChip
          applicationId={row.application?.id}
          fallbackApplicationData={row.application}
        />
      </StyledNameTableCell>
      <TableCell align="right">{row.fieldsCount}</TableCell>
      <StyledActionTableCell>
        {row.link && (
          <IconChevronRight
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.light}
          />
        )}
      </StyledActionTableCell>
    </TableRow>
  );
};
