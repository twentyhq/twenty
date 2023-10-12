import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconCheck,
  IconDotsVertical,
  IconLink,
  IconNumbers,
  IconPlug,
  IconSocial,
  IconUserCircle,
} from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { TableCell } from '@/ui/table/components/TableCell';
import { TableRow } from '@/ui/table/components/TableRow';

import { ObjectFieldItem } from '../types/ObjectFieldItem';

export const StyledObjectFieldTableRow = styled(TableRow)`
  grid-template-columns: 180px 148px 148px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDataType = styled.div<{ value: ObjectFieldItem['dataType'] }>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing(2)};

  ${({ theme, value }) =>
    value === 'relation'
      ? css`
          border-color: ${theme.color.purple20};
          color: ${theme.color.purple};
        `
      : ''}
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconDotsVertical = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const dataTypes: Record<
  ObjectFieldItem['dataType'],
  { label: string; Icon: IconComponent }
> = {
  boolean: { label: 'True/False', Icon: IconCheck },
  number: { label: 'Number', Icon: IconNumbers },
  relation: { label: 'Relation', Icon: IconPlug },
  social: { label: 'Social', Icon: IconSocial },
  teammate: { label: 'Teammate', Icon: IconUserCircle },
  text: { label: 'Text', Icon: IconLink },
};

export const ObjectFieldItemTableRow = ({
  fieldItem,
}: {
  fieldItem: ObjectFieldItem;
}) => {
  const theme = useTheme();
  const dataTypeItem = dataTypes[fieldItem.dataType];

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
        <StyledDataType value={fieldItem.dataType}>
          <dataTypeItem.Icon size={theme.icon.size.sm} />
          {dataTypeItem.label}
        </StyledDataType>
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
