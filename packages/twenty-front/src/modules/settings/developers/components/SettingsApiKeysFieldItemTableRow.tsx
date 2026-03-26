import {
  formatExpiration,
  isExpired,
} from '@/settings/developers/utils/formatExpiration';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconChevronRight } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { type ApiKey } from '~/generated-metadata/graphql';

const StyledEllipsisLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const formattedExpiration = formatExpiration(apiKey.expiresAt || null);

  const gridColumns = '5fr 2fr 3fr 1fr';

  return (
    <TableRow gridAutoColumns={gridColumns} to={to}>
      <TableCell
        color={theme.font.color.primary}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
      >
        <StyledEllipsisLabel>
          {apiKey.name || t`Unnamed API Key`}
        </StyledEllipsisLabel>
      </TableCell>

      <TableCell
        color={theme.font.color.tertiary}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
      >
        <StyledEllipsisLabel>{apiKey.role?.label || '-'}</StyledEllipsisLabel>
      </TableCell>

      <TableCell
        color={
          isExpired(apiKey.expiresAt || null)
            ? theme.font.color.danger
            : theme.font.color.tertiary
        }
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
      >
        <StyledEllipsisLabel>{formattedExpiration}</StyledEllipsisLabel>
      </TableCell>

      <TableCell align="right">
        <IconChevronRight
          size={theme.icon.size.md}
          color={theme.font.color.tertiary}
        />
      </TableCell>
    </TableRow>
  );
};
