import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  formatExpiration,
  isExpired,
} from '@/settings/developers/utils/formatExpiration';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconChevronRight } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { type ApiKey } from '~/generated-metadata/graphql';

export const StyledApisFieldTableRow = styled(TableRow)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledTruncatedCell = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

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
  const theme = useTheme();
  const formattedExpiration = formatExpiration(apiKey.expiresAt || null);

  const gridColumns = '5fr 2fr 3fr 1fr';

  return (
    <StyledApisFieldTableRow gridAutoColumns={gridColumns} to={to}>
      <StyledTruncatedCell color={theme.font.color.primary}>
        <StyledEllipsisLabel>{apiKey.name}</StyledEllipsisLabel>
      </StyledTruncatedCell>

      <StyledTruncatedCell color={theme.font.color.tertiary}>
        <StyledEllipsisLabel>{apiKey.role?.label || '-'}</StyledEllipsisLabel>
      </StyledTruncatedCell>

      <StyledTruncatedCell
        color={
          isExpired(apiKey.expiresAt || null)
            ? theme.font.color.danger
            : theme.font.color.tertiary
        }
      >
        <StyledEllipsisLabel>{formattedExpiration}</StyledEllipsisLabel>
      </StyledTruncatedCell>

      <TableCell align="right">
        <IconChevronRight
          size={theme.icon.size.md}
          color={theme.font.color.tertiary}
        />
      </TableCell>
    </StyledApisFieldTableRow>
  );
};
