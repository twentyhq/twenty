import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconDotsVertical } from '@/ui/icon';
import { TableCell } from '@/ui/table/components/TableCell';
import { TableRow } from '@/ui/table/components/TableRow';

import { ObjectFieldItem } from '../types/ObjectFieldItem';

import { ObjectFieldDataType } from './ObjectFieldDataType';

export const StyledObjectFieldTableRow = styled(TableRow)`
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

const StyledIconDotsVertical = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const ObjectFieldItemTableRow = ({
  fieldItem,
}: {
  fieldItem: ObjectFieldItem;
}) => {
  const theme = useTheme();

  return (
    <StyledObjectFieldTableRow>
      <StyledNameTableCell>
        <fieldItem.Icon size={theme.icon.size.md} />
        {fieldItem.name}
      </StyledNameTableCell>
      <TableCell>
        {fieldItem.type === 'standard' ? 'Standard' : 'Custom'}
      </TableCell>
      <TableCell>
        <ObjectFieldDataType value={fieldItem.dataType} />
      </TableCell>
      <StyledIconTableCell>
        <StyledIconDotsVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
