import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext } from 'react';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import {
  SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  StyledActionTableCell,
  StyledNameTableCell,
  StyledStickyFirstCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type SettingsObjectMetadataItemTableRowProps = {
  action: ReactNode;
  objectMetadataItem: EnrichedObjectMetadataItem;
  link?: string;
  totalObjectCount: number;
};

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledInactiveLabel = styled.span`
  color: ${themeCssVariables.font.color.extraLight};
  flex: 0 999 auto;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: '·';
    margin-right: ${themeCssVariables.spacing[1]};
  }
`;

export const SettingsObjectMetadataItemTableRow = ({
  action,
  objectMetadataItem,
  link,
  totalObjectCount,
}: SettingsObjectMetadataItemTableRowProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  return (
    <TableRow
      gridTemplateColumns={SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      key={objectMetadataItem.namePlural}
      to={link}
    >
      <StyledStickyFirstCell>
        <StyledNameTableCell>
          <ObjectMetadataIcon
            objectMetadataItem={objectMetadataItem}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
          <StyledNameContainer>
            <StyledNameLabel title={objectMetadataItem.labelPlural}>
              {objectMetadataItem.labelPlural}
            </StyledNameLabel>
            {!objectMetadataItem.isActive && (
              <StyledInactiveLabel>{t`Deactivated`}</StyledInactiveLabel>
            )}
          </StyledNameContainer>
        </StyledNameTableCell>
      </StyledStickyFirstCell>
      <TableCell>
        <SettingsItemTypeTag item={objectMetadataItem} />
      </TableCell>
      <TableCell align="right">
        {
          objectMetadataItem.fields.filter(
            (field) => !isHiddenSystemField(field),
          ).length
        }
      </TableCell>
      <TableCell align="right">{totalObjectCount}</TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </TableRow>
  );
};
