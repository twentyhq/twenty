import { styled } from '@linaria/react';

import {
  formatExpiration,
  isExpired,
} from '@/settings/developers/utils/formatExpiration';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconChevronRight } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { type ApiKey } from '~/generated-metadata/graphql';

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

type ApiKeyType = Pick<ApiKey, 'id' | 'name' | 'expiresAt' | 'revokedAt'> & {
  role?: { id: string; label: string; icon?: string | null } | null;
};

type SettingsApiKeysFieldItemTableRowProps = {
  apiKey: ApiKeyType;
  to: string;
};

export const SettingsApiKeysFieldItemTableRow = ({
  apiKey,
  to,
}: SettingsApiKeysFieldItemTableRowProps) => {
  const formattedExpiration = formatExpiration(apiKey.expiresAt || null);

  const gridColumns = '5fr 2fr 3fr 1fr';

  return (
    <TableRow gridAutoColumns={gridColumns} to={to}>
      <TableCell
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
        color={resolveThemeVariable(themeCssVariables.font.color.primary)}
      >
        <StyledEllipsisLabel>{apiKey.name}</StyledEllipsisLabel>
      </TableCell>

      <TableCell
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
        color={resolveThemeVariable(themeCssVariables.font.color.tertiary)}
      >
        <StyledEllipsisLabel>{apiKey.role?.label || '-'}</StyledEllipsisLabel>
      </TableCell>

      <TableCell
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
        color={
          isExpired(apiKey.expiresAt || null)
            ? resolveThemeVariable(themeCssVariables.font.color.danger)
            : resolveThemeVariable(themeCssVariables.font.color.tertiary)
        }
      >
        <StyledEllipsisLabel>{formattedExpiration}</StyledEllipsisLabel>
      </TableCell>

      <TableCell align="right">
        <IconChevronRight
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
          color={resolveThemeVariable(themeCssVariables.font.color.tertiary)}
        />
      </TableCell>
    </TableRow>
  );
};
