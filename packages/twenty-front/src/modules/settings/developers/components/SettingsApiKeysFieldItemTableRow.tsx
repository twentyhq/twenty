import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronRight, MOBILE_VIEWPORT } from 'twenty-ui';

import { ApiFieldItem } from '@/settings/developers/types/api-key/ApiFieldItem';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

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
  fieldItem: ApiFieldItem;
  to: string;
}) => {
  const theme = useTheme();

  return (
    <StyledApisFieldTableRow to={to}>
      <StyledNameTableCell>{fieldItem.name}</StyledNameTableCell>
      <TableCell
        color={
          fieldItem.expiration === 'Expired'
            ? theme.font.color.danger
            : theme.font.color.tertiary
        }
      >
        {fieldItem.expiration}
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
