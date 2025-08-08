import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { OverridableCheckbox } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/OverridableCheckbox';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { v4 } from 'uuid';
import { FieldPermission, RelationType } from '~/generated/graphql';

export const StyledObjectFieldTableRow = styled(TableRow)`
  grid-template-columns: 180px 1fr 60px 60px;
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

type SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRowProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  fieldPermissions: FieldPermission[];
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow =
  ({
    fieldMetadataItem,
    fieldPermissions,
    objectMetadataItem,
    roleId,
  }: SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRowProps) => {
    const theme = useTheme();
    const { getIcon } = useIcons();
    const Icon = getIcon(fieldMetadataItem.icon);

    const getRelationMetadata = useGetRelationMetadata();

    const { relationObjectMetadataItem, relationType } =
      useMemo(
        () => getRelationMetadata({ fieldMetadataItem }),
        [fieldMetadataItem, getRelationMetadata],
      ) ?? {};
    const fieldType = fieldMetadataItem.type;

    const RelationIcon = relationType
      ? RELATION_TYPES[relationType].Icon
      : undefined;

    const fieldPermissionForThisFieldMetadataItem = fieldPermissions.find(
      (fieldPermissionItem) =>
        fieldPermissionItem.fieldMetadataId === fieldMetadataItem.id,
    );

    const { upsertFieldPermissionInDraftRole } =
      useUpsertFieldPermissionInDraftRole(roleId);

    const handleSeeChange = () => {
      if (isDefined(fieldPermissionForThisFieldMetadataItem)) {
        if (
          fieldPermissionForThisFieldMetadataItem.canReadFieldValue === false
        ) {
          upsertFieldPermissionInDraftRole({
            ...fieldPermissionForThisFieldMetadataItem,
            canReadFieldValue: null,
          });
        } else {
          upsertFieldPermissionInDraftRole({
            ...fieldPermissionForThisFieldMetadataItem,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          });
        }
      } else {
        upsertFieldPermissionInDraftRole({
          id: v4(),
          fieldMetadataId: fieldMetadataItem.id,
          objectMetadataId: objectMetadataItem.id,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
          roleId,
        });
      }
    };

    const handleUpdateChange = () => {
      if (isDefined(fieldPermissionForThisFieldMetadataItem)) {
        if (
          fieldPermissionForThisFieldMetadataItem.canUpdateFieldValue === false
        ) {
          upsertFieldPermissionInDraftRole({
            ...fieldPermissionForThisFieldMetadataItem,
            canUpdateFieldValue: null,
            canReadFieldValue: null,
          });
        } else {
          upsertFieldPermissionInDraftRole({
            ...fieldPermissionForThisFieldMetadataItem,
            canUpdateFieldValue: false,
          });
        }
      } else {
        upsertFieldPermissionInDraftRole({
          id: v4(),
          fieldMetadataId: fieldMetadataItem.id,
          objectMetadataId: objectMetadataItem.id,
          canUpdateFieldValue: false,
          roleId,
        });
      }
    };

    const hasRestriction = isDefined(fieldPermissionForThisFieldMetadataItem);

    const isReadRestricted =
      hasRestriction &&
      fieldPermissionForThisFieldMetadataItem?.canReadFieldValue === false;

    const isUpdateRestricted =
      hasRestriction &&
      fieldPermissionForThisFieldMetadataItem?.canUpdateFieldValue === false;

    const { objectReadIsRestricted, objectUpdateIsRestricted } =
      useObjectPermissionDerivedStates({
        roleId,
        objectMetadataItemId: objectMetadataItem.id,
      });

    return (
      <StyledObjectFieldTableRow>
        <StyledNameTableCell>
          {!!Icon && (
            <Icon
              style={{ minWidth: theme.icon.size.md }}
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          )}
          <StyledNameLabel title={fieldMetadataItem.label}>
            {fieldMetadataItem.label}
          </StyledNameLabel>
        </StyledNameTableCell>
        <TableCell>
          <SettingsObjectFieldDataType
            Icon={RelationIcon}
            label={
              relationType === RelationType.MANY_TO_ONE
                ? relationObjectMetadataItem?.labelSingular
                : relationObjectMetadataItem?.labelPlural
            }
            labelDetail={
              fieldMetadataItem.settings?.type === 'percentage'
                ? '%'
                : undefined
            }
            value={fieldType as SettingsFieldType}
          />
        </TableCell>
        {objectReadIsRestricted ? (
          <TableCell />
        ) : (
          <TableCell>
            <OverridableCheckbox
              disabled={false}
              checked={true}
              onChange={handleSeeChange}
              type={isReadRestricted ? 'override' : 'default'}
            />
          </TableCell>
        )}
        {objectUpdateIsRestricted ? (
          <TableCell />
        ) : (
          <TableCell align="left">
            <OverridableCheckbox
              disabled={false}
              checked={true}
              onChange={handleUpdateChange}
              type={isUpdateRestricted ? 'override' : 'default'}
            />
          </TableCell>
        )}
      </StyledObjectFieldTableRow>
    );
  };
