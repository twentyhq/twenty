import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useFindManyObjects } from '@/metadata/hooks/useFindManyObjects';
import { ObjectMetadataItem } from '@/metadata/types/ObjectMetadataItem';
import { Tag } from '@/ui/display/tag/components/Tag';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';
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

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(4)};
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

  const { objects } = useFindManyObjects({
    objectNamePlural: objectItem.namePlural,
  });

  const { Icon } = useLazyLoadIcon(objectItem.icon ?? '');

  return (
    <StyledObjectTableRow key={objectItem.namePlural} onClick={onClick}>
      <StyledNameTableCell>
        {!!Icon && <Icon size={theme.icon.size.md} />}
        {objectItem.labelPlural}
      </StyledNameTableCell>
      <TableCell>
        {objectItem.isCustom ? (
          <StyledTag color="orange" text="Custom" />
        ) : (
          <StyledTag color="blue" text="Standard" />
        )}
      </TableCell>
      <TableCell align="right">{objectItem.fields.length}</TableCell>
      <TableCell align="right">{objects.length}</TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledObjectTableRow>
  );
};
