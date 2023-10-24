import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronRight } from '@/ui/display/icon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

import { ApiKeyItem } from '../types/ApisFieldItem';

export const StyledApisFieldTableRow = styled(TableRow)`
  grid-template-columns: 180px 148px 148px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsApiKeysFieldItemTableRow = ({
  fieldItem,
}: {
  fieldItem: ApiKeyItem;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/settings/developers/api-keys/${fieldItem.id}`);
  };

  return (
    <StyledApisFieldTableRow onClick={onClick}>
      <StyledNameTableCell>{fieldItem.name}</StyledNameTableCell>
      <TableCell color={theme.font.color.tertiary}>Internal</TableCell>{' '}
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
