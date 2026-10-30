import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { getApplicationTableRowGridTemplateColumns } from '@/settings/applications/utils/getApplicationTableRowGridTemplateColumns';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

type SettingsApplicationTableRowProps = {
  name: ReactNode;
  middle: ReactNode;
  details: ReactNode;
  action: ReactNode;
  middleColumn?: SettingsApplicationTableRowMiddleColumn;
  detailsAlign?: 'left' | 'right';
  link?: string;
  hasActionMenu?: boolean;
};

export const SettingsApplicationTableRow = ({
  name,
  middle,
  details,
  action,
  middleColumn = 'type',
  detailsAlign,
  link,
  hasActionMenu = false,
}: SettingsApplicationTableRowProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // A menu cannot sit inside a link, so those rows only link their name
  const isNameLink = hasActionMenu && isDefined(link);

  const nameCell = (
    <StyledNameTableCell minWidth="0" overflow="hidden">
      {name}
    </StyledNameTableCell>
  );

  return (
    <TableRow
      gridTemplateColumns={getApplicationTableRowGridTemplateColumns({
        middleColumn,
        isMobile,
      })}
      to={hasActionMenu ? undefined : link}
      onClick={isNameLink ? () => navigate(link) : undefined}
    >
      {isNameLink ? (
        <UndecoratedLink to={link} onClick={(event) => event.stopPropagation()}>
          {nameCell}
        </UndecoratedLink>
      ) : (
        nameCell
      )}
      <TableCell color={themeCssVariables.font.color.tertiary}>
        {middle}
      </TableCell>
      {!isMobile && (
        <TableCell
          align={detailsAlign}
          gap={themeCssVariables.spacing[2]}
          minWidth="0"
        >
          {details}
        </TableCell>
      )}
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
        color={themeCssVariables.font.color.tertiary}
        onClick={hasActionMenu ? (event) => event.stopPropagation() : undefined}
      >
        {action}
      </TableCell>
    </TableRow>
  );
};
