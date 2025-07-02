import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

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
  fieldItem,
  to,
}: {
  fieldItem: Pick<ApiKey, 'id' | 'name' | 'expiresAt' | 'revokedAt'>;
  to: string;
}) => {
  const theme = useTheme();

  return (
    <StyledApisFieldTableRow to={to}>
      <StyledNameTableCell>
        <OverflowingTextWithTooltip text={fieldItem.name} />
      </StyledNameTableCell>
      <TableCell
        color={
          new Date(fieldItem.expiresAt) < new Date()
            ? theme.font.color.danger
            : theme.font.color.tertiary
        }
      >
        {fieldItem.expiresAt}
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
