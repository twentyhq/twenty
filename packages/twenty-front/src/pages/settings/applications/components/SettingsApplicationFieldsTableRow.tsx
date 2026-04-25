import {
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

import { type ApplicationFieldRow } from '~/pages/settings/applications/components/SettingsApplicationDataTable';

const StyledLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledObjectCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const SettingsApplicationFieldsTableRow = ({
  row,
  gridAutoColumns,
}: {
  row: ApplicationFieldRow;
  gridAutoColumns: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const FieldIcon = getIcon(row.fieldIcon);
  const ObjectIcon = getIcon(row.objectIcon);

  return (
    <TableRow gridAutoColumns={gridAutoColumns} to={row.link}>
      <StyledNameTableCell minWidth="0" overflow="hidden">
        {isDefined(FieldIcon) && (
          <FieldIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        <StyledLabel title={row.fieldLabel}>{row.fieldLabel}</StyledLabel>
      </StyledNameTableCell>
      <TableCell minWidth="0" overflow="hidden">
        <StyledObjectCell>
          {isDefined(ObjectIcon) && (
            <ObjectIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          )}
          <StyledLabel title={row.objectLabel}>{row.objectLabel}</StyledLabel>
        </StyledObjectCell>
      </TableCell>
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
