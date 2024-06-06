import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsObjectItemTableRowProps = {
  action: ReactNode;
  objectItem: ObjectMetadataItem;
  to?: string;
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
  to,
}: SettingsObjectItemTableRowProps) => {
  const theme = useTheme();

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectItem.nameSingular,
  });
  const { getIcon } = useIcons();
  const Icon = getIcon(objectItem.icon);
  const objectTypeLabel = getObjectTypeLabel(objectItem);

  return (
    <StyledObjectTableRow key={objectItem.namePlural} to={to}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        {objectItem.labelPlural}
      </StyledNameTableCell>
      <TableCell>
        <SettingsDataModelObjectTypeTag objectTypeLabel={objectTypeLabel} />
      </TableCell>
      <TableCell align="right">
        {objectItem.fields.filter((field) => !field.isSystem).length}
      </TableCell>
      <TableCell align="right">{totalCount}</TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledObjectTableRow>
  );
};
