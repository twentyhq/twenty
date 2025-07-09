import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { formatExpiration } from '@/settings/developers/utils/formatExpiration';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { ApiKey } from '~/generated-metadata/graphql';

export const StyledApisFieldTableRow = styled(TableRow)`
  grid-template-columns: 312px auto 28px;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    grid-template-columns: 12fr 4fr;
  }
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-left: 0;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsApiKeysFieldItemTableRow = ({
  apiKey,
  to,
}: {
  apiKey: Pick<ApiKey, 'id' | 'name' | 'expiresAt' | 'revokedAt'>;
  to: string;
}) => {
  const theme = useTheme();
  const formattedExpiration = formatExpiration(apiKey.expiresAt || null);

  return (
    <StyledApisFieldTableRow to={to}>
      <StyledNameTableCell>
        <OverflowingTextWithTooltip text={apiKey.name} />
      </StyledNameTableCell>
      <TableCell
        color={
          formattedExpiration === 'Expired'
            ? theme.font.color.danger
            : theme.font.color.tertiary
        }
      >
        {formattedExpiration}
      </TableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconTableCell>
    </StyledApisFieldTableRow>
  );
};
