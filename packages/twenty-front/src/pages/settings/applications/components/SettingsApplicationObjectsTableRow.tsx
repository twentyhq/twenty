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
import { ThemeContext } from 'twenty-ui/theme-constants';

import { type ApplicationObjectRow } from '~/pages/settings/applications/components/SettingsApplicationDataTable';

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsApplicationObjectsTableRow = ({
  row,
  gridAutoColumns,
}: {
  row: ApplicationObjectRow;
  gridAutoColumns: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const Icon = getIcon(row.icon);

  return (
    <TableRow gridAutoColumns={gridAutoColumns} to={row.link}>
      <StyledNameTableCell minWidth="0" overflow="hidden">
        {isDefined(Icon) && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        <StyledNameLabel title={row.labelPlural}>
          {row.labelPlural}
        </StyledNameLabel>
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
