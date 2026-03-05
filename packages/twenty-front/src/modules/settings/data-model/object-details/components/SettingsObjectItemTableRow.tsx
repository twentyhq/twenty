import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { StyledObjectTableRowContainer } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useIcons } from 'twenty-ui/display';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export type SettingsObjectMetadataItemTableRowProps = {
  action: ReactNode;
  objectMetadataItem: ObjectMetadataItem;
  link?: string;
  totalObjectCount: number;
};

const StyledNameContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledInactiveLabel = styled.span`
  color: ${themeCssVariables.font.color.extraLight};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 0 999 auto;
  min-width: 48px;

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

  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem.icon);

  return (
    <StyledObjectTableRowContainer>
      <TableRow to={link}>
        <TableCell
          color={themeCssVariables.font.color.primary}
          gap={themeCssVariables.spacing[2]}
        >
          {!!Icon && (
            <Icon
              style={{
                minWidth: resolveThemeVariableAsNumber(
                  themeCssVariables.icon.size.md,
                ),
              }}
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              stroke={resolveThemeVariableAsNumber(
                themeCssVariables.icon.stroke.sm,
              )}
            />
          )}
          <StyledNameContainer>
            <StyledNameLabel title={objectMetadataItem.labelPlural}>
              {objectMetadataItem.labelPlural}
            </StyledNameLabel>
            {!objectMetadataItem.isActive && (
              <StyledInactiveLabel>{t`Deactivated`}</StyledInactiveLabel>
            )}
          </StyledNameContainer>
        </TableCell>
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
        <TableCell
          align="center"
          padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
        >
          {action}
        </TableCell>
      </TableRow>
    </StyledObjectTableRowContainer>
  );
};
