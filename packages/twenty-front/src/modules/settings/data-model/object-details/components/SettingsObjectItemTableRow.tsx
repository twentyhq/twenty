import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons } from 'twenty-ui/display';

export type SettingsObjectMetadataItemTableRowProps = {
  action: ReactNode;
  objectMetadataItem: ObjectMetadataItem;
  link?: string;
  totalObjectCount: number;
};

export const StyledObjectTableRow = styled(TableRow)`
  grid-template-columns: 180px 98.7px 98.7px 98.7px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledInactiveLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsObjectMetadataItemTableRow = ({
  action,
  objectMetadataItem,
  link,
  totalObjectCount,
}: SettingsObjectMetadataItemTableRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem.icon);

  return (
    <StyledObjectTableRow key={objectMetadataItem.namePlural} to={link}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameLabel title={objectMetadataItem.labelPlural}>
          {objectMetadataItem.labelPlural}
          {!objectMetadataItem.isActive && (
            <StyledInactiveLabel>{t`Deactivated`}</StyledInactiveLabel>
          )}
        </StyledNameLabel>
      </StyledNameTableCell>
      <TableCell>
        <SettingsItemTypeTag item={objectMetadataItem} />
      </TableCell>
      <TableCell align="right">
        {objectMetadataItem.fields.filter((field) => !field.isSystem).length}
      </TableCell>
      <TableCell align="right">{totalObjectCount}</TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledObjectTableRow>
  );
};
