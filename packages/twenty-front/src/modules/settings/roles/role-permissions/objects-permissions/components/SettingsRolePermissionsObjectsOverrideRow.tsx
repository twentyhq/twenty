/* oxlint-disable twenty/no-navigate-prefer-link */
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectAccessSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectAccessSelect';
import { SettingsRolePermissionsObjectsOverrideRowOptionsDropdown } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsOverrideRowOptionsDropdown';
import { SETTINGS_ROLE_OBJECT_OVERRIDES_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectOverridesTableGridTemplateColumns';
import { useSetObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSetObjectActionPermissions';
import { type SettingsRoleObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectAccessLevel';
import { getActionPermissionsFromObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/utils/getActionPermissionsFromObjectAccessLevel';
import { getEffectiveObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getEffectiveObjectActionPermissions';
import { getObjectAccessLevelFromActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectAccessLevelFromActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isNonEmptyArray } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  white-space: nowrap;
`;

type SettingsRolePermissionsObjectsOverrideRowProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  isEditable: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectsOverrideRow = ({
  objectMetadataItem,
  roleId,
  isEditable,
  fromAgentId,
}: SettingsRolePermissionsObjectsOverrideRowProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { setObjectActionPermissions } = useSetObjectActionPermissions(roleId);

  const objectPermissionDetailPath = getSettingsPath(
    SettingsPath.RoleObjectLevel,
    { roleId, objectMetadataId: objectMetadataItem.id },
    fromAgentId ? { fromAgent: fromAgentId } : undefined,
  );

  const accessLevel = getObjectAccessLevelFromActionPermissions(
    getEffectiveObjectActionPermissions(
      settingsDraftRole,
      objectMetadataItem.id,
    ),
  );

  const restrictedFieldCount =
    settingsDraftRole.fieldPermissions?.filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataItem.id &&
        (fieldPermission.canReadFieldValue === false ||
          fieldPermission.canUpdateFieldValue === false),
    ).length ?? 0;

  const hasRecordRule = isNonEmptyArray(
    settingsDraftRole.rowLevelPermissionPredicates?.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
    ),
  );

  const hints = [
    ...(restrictedFieldCount > 0
      ? [
          plural(restrictedFieldCount, {
            one: `${restrictedFieldCount} restricted field`,
            other: `${restrictedFieldCount} restricted fields`,
          }),
        ]
      : []),
    ...(hasRecordRule ? [t`Record rule`] : []),
  ];

  const handleAccessLevelChange = (
    newAccessLevel: SettingsRoleObjectAccessLevel,
  ) => {
    if (newAccessLevel === 'ADVANCED') {
      navigate(objectPermissionDetailPath);
      return;
    }

    setObjectActionPermissions(
      objectMetadataItem.id,
      getActionPermissionsFromObjectAccessLevel(newAccessLevel),
    );
  };

  return (
    <TableRow
      gridTemplateColumns={
        SETTINGS_ROLE_OBJECT_OVERRIDES_TABLE_GRID_TEMPLATE_COLUMNS
      }
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[1]}
      >
        <ObjectMetadataIcon
          objectMetadataItem={objectMetadataItem}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
        <StyledNameLabel>
          <OverflowingTextWithTooltip text={objectMetadataItem.labelPlural} />
        </StyledNameLabel>
        {hints.map((hint) => (
          <StyledHint key={hint}>{` · ${hint}`}</StyledHint>
        ))}
      </TableCell>
      <TableCell>
        <SettingsRolePermissionsObjectAccessSelect
          dropdownId={`settings-role-object-access-${objectMetadataItem.id}`}
          value={accessLevel}
          disabled={!isEditable}
          onChange={handleAccessLevelChange}
        />
      </TableCell>
      <TableCell align="right" padding={`0 ${themeCssVariables.spacing[1]}`}>
        <SettingsRolePermissionsObjectsOverrideRowOptionsDropdown
          roleId={roleId}
          objectMetadataId={objectMetadataItem.id}
          objectPermissionDetailUrl={objectPermissionDetailPath}
          isEditable={isEditable}
        />
      </TableCell>
    </TableRow>
  );
};
