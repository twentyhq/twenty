import { type ReactNode } from 'react';

import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '~/pages/settings/applications/components/SettingsApplicationTableRow';

const StyledNativeApplicationName = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type SettingsNativeApplicationTableRowProps = {
  nativeAccountApp: NativeAccountApp;
  action: ReactNode;
};

export const SettingsNativeApplicationTableRow = ({
  nativeAccountApp,
  action,
}: SettingsNativeApplicationTableRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <TableRow
      gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={getSettingsPath(SettingsPath.NativeApplicationDetail, {
        nativeAccountAppId: nativeAccountApp.id,
      })}
    >
      <StyledNameTableCell minWidth="0" overflow="hidden">
        <StyledNativeApplicationName>
          <nativeAccountApp.Icon size={theme.icon.size.md} />
          <OverflowingTextWithTooltip text={t(nativeAccountApp.name)} />
        </StyledNativeApplicationName>
      </StyledNameTableCell>
      <TableCell color={themeCssVariables.font.color.tertiary}>
        {t`Built-in`}
      </TableCell>
      <TableCell minWidth="0">
        <OverflowingTextWithTooltip text={t(nativeAccountApp.description)} />
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
        color={themeCssVariables.font.color.tertiary}
      >
        {action}
      </TableCell>
    </TableRow>
  );
};
