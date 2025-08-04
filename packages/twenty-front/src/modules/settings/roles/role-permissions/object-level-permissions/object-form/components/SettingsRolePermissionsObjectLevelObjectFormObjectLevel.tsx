import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow';
import { SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { SettingsRolePermissionsObjectLevelPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRolePermissionsObjectLevelObjectFormObjectLevelProps = {
  roleId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevel = ({
  roleId,
  objectMetadataItem,
}: SettingsRolePermissionsObjectLevelObjectFormObjectLevelProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const settingsDraftRoleObjectPermissions =
    settingsDraftRole.objectPermissions?.find(
      (permission) => permission.objectMetadataId === objectMetadataItem.id,
    );

  if (!settingsDraftRoleObjectPermissions) {
    return null;
  }

  const objectLabelPlural = objectMetadataItem.labelPlural;

  const updateObjectPermission = (
    permissionKey: SettingsRoleObjectPermissionKey,
    value: boolean | null,
  ) => {
    setSettingsDraftRole((currentRole) => {
      if (!currentRole.objectPermissions) {
        return currentRole;
      }

      const updatedPermissions = currentRole.objectPermissions.map((perm) => {
        if (perm.objectMetadataId !== objectMetadataItem.id) {
          return perm;
        }

        const newPerms = { ...perm, [permissionKey]: value };

        const isHigherPermission =
          permissionKey === 'canUpdateObjectRecords' ||
          permissionKey === 'canSoftDeleteObjectRecords' ||
          permissionKey === 'canDestroyObjectRecords';

        if (isHigherPermission && value !== false) {
          newPerms.canReadObjectRecords = value;
        }

        if (permissionKey === 'canReadObjectRecords' && !value) {
          newPerms.canUpdateObjectRecords = false;
          newPerms.canSoftDeleteObjectRecords = false;
          newPerms.canDestroyObjectRecords = false;
        }

        return newPerms;
      });

      return { ...currentRole, objectPermissions: updatedPermissions };
    });
  };

  const objectPermissionsConfig: SettingsRolePermissionsObjectLevelPermission[] =
    [
      {
        key: 'canReadObjectRecords',
        label: t`See ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions.canReadObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canReadObjectRecords', value);
        },
      },
      {
        key: 'canUpdateObjectRecords',
        label: t`Edit ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions.canUpdateObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canUpdateObjectRecords', value);
        },
      },
      {
        key: 'canSoftDeleteObjectRecords',
        label: t`Delete ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions.canSoftDeleteObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canSoftDeleteObjectRecords', value);
        },
      },
      {
        key: 'canDestroyObjectRecords',
        label: t`Destroy ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions.canDestroyObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canDestroyObjectRecords', value);
        },
      },
    ];

  return (
    <Section>
      <H2Title
        title={t`Object-Level`}
        description={t`Actions users can perform on this object`}
      />
      <StyledTable>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader />
        <StyledTableRows>
          {objectPermissionsConfig.map((permission) => (
            <SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow
              key={permission.key}
              permission={permission}
              isEditable={settingsDraftRole.isEditable}
              settingsDraftRoleObjectPermissions={
                settingsDraftRoleObjectPermissions
              }
              roleId={roleId}
            />
          ))}
        </StyledTableRows>
      </StyledTable>
    </Section>
  );
};
