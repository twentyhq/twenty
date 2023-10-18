import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

import { ObjectFieldItem } from '../../types/ObjectFieldItem';

import { SettingsObjectFieldDataType } from './SettingsObjectFieldDataType';

type SettingsObjectFieldItemTableRowProps = {
  ActionIcon: IconComponent;
  fieldItem: ObjectFieldItem;
};

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

export const SettingsObjectFieldItemTableRow = ({
  ActionIcon,
  fieldItem,
}: SettingsObjectFieldItemTableRowProps) => {
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
        <SettingsObjectFieldDataType value={fieldItem.dataType} />
      </TableCell>
      <StyledIconTableCell>
        <LightIconButton Icon={ActionIcon} accent="tertiary" />
      </StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
