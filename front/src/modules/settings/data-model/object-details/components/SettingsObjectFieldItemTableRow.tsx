import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

import { dataTypes } from '../../constants/dataTypes';

import { SettingsObjectFieldDataType } from './SettingsObjectFieldDataType';

type SettingsObjectFieldItemTableRowProps = {
  ActionIcon: ReactNode;
  fieldItem: FieldMetadataItem;
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
  const { Icon } = useLazyLoadIcon(fieldItem.icon ?? '');

  // TODO: parse with zod and merge types with FieldType (create a subset of FieldType for example)
  const fieldDataTypeIsSupported = Object.keys(dataTypes).includes(
    fieldItem.type,
  );

  if (!fieldDataTypeIsSupported) return null;

  return (
    <StyledObjectFieldTableRow>
      <StyledNameTableCell>
        {!!Icon && <Icon size={theme.icon.size.md} />}
        {fieldItem.label}
      </StyledNameTableCell>
      <TableCell>{fieldItem.isCustom ? 'Custom' : 'Standard'}</TableCell>
      <TableCell>
        <SettingsObjectFieldDataType value={fieldItem.type} />
      </TableCell>
      <StyledIconTableCell>{ActionIcon}</StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
