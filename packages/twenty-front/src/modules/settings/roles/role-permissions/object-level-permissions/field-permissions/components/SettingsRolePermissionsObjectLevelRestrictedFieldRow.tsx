import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { RESTRICTED_FIELDS_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/constants/RestrictedFieldsTableGridTemplateColumns';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { type SettingsRoleFieldRestriction } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/types/SettingsRoleFieldRestriction';
import { getFieldPermissionFromRestriction } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getFieldPermissionFromRestriction';
import { getFieldRestrictionSelectOptions } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getFieldRestrictionSelectOptions';
import { Select } from '@/ui/input/components/Select';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconTrash, useIcons } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  type FieldPermission,
  RelationType,
} from '~/generated-metadata/graphql';

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsRolePermissionsObjectLevelRestrictedFieldRowProps = {
  fieldMetadataItem: FieldMetadataItem;
  fieldPermission: FieldPermission;
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectLevelRestrictedFieldRow = ({
  fieldMetadataItem,
  fieldPermission,
  objectMetadataItem,
  roleId,
  isEditable,
}: SettingsRolePermissionsObjectLevelRestrictedFieldRowProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(fieldMetadataItem.icon);

  const getRelationMetadata = useGetRelationMetadata();

  const { relationObjectMetadataItem, relationType } =
    getRelationMetadata({ fieldMetadataItem }) ?? {};

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const { cannotAllowFieldReadRestrict, cannotAllowFieldUpdateRestrict } =
    useObjectPermissionDerivedStates({
      roleId,
      objectMetadataItemId: objectMetadataItem.id,
    });

  const isLabelIdentifier =
    objectMetadataItem.labelIdentifierFieldMetadataId === fieldMetadataItem.id;

  const restriction: SettingsRoleFieldRestriction =
    fieldPermission.canReadFieldValue === false ? 'CANNOT_SEE' : 'CANNOT_EDIT';

  const isDisabled = !isEditable || !(fieldMetadataItem.isUIEditable ?? true);

  const handleRestrictionChange = (
    newRestriction: SettingsRoleFieldRestriction,
  ) => {
    upsertFieldPermissionInDraftRole(
      getFieldPermissionFromRestriction({
        fieldPermission,
        restriction: newRestriction,
      }),
    );
  };

  const handleRemove = () => {
    upsertFieldPermissionInDraftRole({
      ...fieldPermission,
      canReadFieldValue: null,
      canUpdateFieldValue: null,
    });
  };

  return (
    <TableRow
      gridTemplateColumns={RESTRICTED_FIELDS_TABLE_GRID_TEMPLATE_COLUMNS}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        {isDefined(Icon) && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameLabel title={fieldMetadataItem.label}>
          {fieldMetadataItem.label}
        </StyledNameLabel>
      </TableCell>
      <TableCell>
        {isFieldTypeSupportedInSettings(fieldMetadataItem.type) && (
          <SettingsObjectFieldDataType
            Icon={
              isDefined(relationType)
                ? RELATION_TYPES[relationType].Icon
                : undefined
            }
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
            value={fieldMetadataItem.type}
          />
        )}
      </TableCell>
      <TableCell>
        <Select
          selectSizeVariant="small"
          dropdownId={`settings-role-field-restriction-${fieldMetadataItem.id}`}
          options={getFieldRestrictionSelectOptions({
            canRestrictRead:
              !cannotAllowFieldReadRestrict && !isLabelIdentifier,
            canRestrictUpdate: !cannotAllowFieldUpdateRestrict,
          })}
          value={restriction}
          disabled={isDisabled}
          onChange={handleRestrictionChange}
        />
      </TableCell>
      <TableCell align="right" padding={`0 ${themeCssVariables.spacing[1]}`}>
        <IconButton
          aria-label={t`Remove field restriction`}
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={handleRemove}
        >
          <IconTrash />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
