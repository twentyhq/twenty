import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDataModelIsCustomTag } from '@/settings/data-model/objects/SettingsDataModelIsCustomTag';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsObjectItemTableRowProps = {
  action: ReactNode;
  objectItem: ObjectMetadataItem;
  onClick?: () => void;
};

export const StyledObjectTableRow = styled(TableRow)`
  grid-template-columns: 180px 98.7px 98.7px 98.7px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsObjectItemTableRow = ({
  action,
  objectItem,
  onClick,
}: SettingsObjectItemTableRowProps) => {
  const theme = useTheme();

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectItem.nameSingular,
    depth: 0,
  });
  const { getIcon } = useIcons();
  const Icon = getIcon(objectItem.icon);

  return (
    <StyledObjectTableRow key={objectItem.namePlural} onClick={onClick}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        {objectItem.labelPlural}
      </StyledNameTableCell>
      <TableCell>
        <SettingsDataModelIsCustomTag isCustom={objectItem.isCustom} />
      </TableCell>
      <TableCell align="right">
        {objectItem.fields.filter((field) => !field.isSystem).length}
      </TableCell>
      <TableCell align="right">{totalCount}</TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledObjectTableRow>
  );
};
