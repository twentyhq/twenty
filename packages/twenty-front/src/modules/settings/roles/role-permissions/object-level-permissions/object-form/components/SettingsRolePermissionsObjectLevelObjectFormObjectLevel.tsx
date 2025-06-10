import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow';
import { SettingsRolePermissionsObjectLevelPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ObjectPermission } from '~/generated-metadata/graphql';

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

  const objectLabel = objectMetadataItem.labelPlural;

  const updateObjectPermission = (
    permissionKey: keyof ObjectPermission,
    value: boolean | null,
  ) => {
    setSettingsDraftRole((currentRole) => {
      const updatedPermissions = currentRole.objectPermissions?.map((perm) => {
        if (perm.objectMetadataId === objectMetadataItem.id) {
          return { ...perm, [permissionKey]: value };
        }
        return perm;
      });
      return { ...currentRole, objectPermissions: updatedPermissions };
    });
  };

  const objectPermissionsConfig: SettingsRolePermissionsObjectLevelPermission[] =
    [
      {
        key: 'canReadObjectRecords',
        label: t`See Records on ${objectLabel}`,
        value: settingsDraftRoleObjectPermissions.canReadObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canReadObjectRecords', value);
        },
      },
      {
        key: 'canUpdateObjectRecords',
        label: t`Edit Records on ${objectLabel}`,
        value: settingsDraftRoleObjectPermissions.canUpdateObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canUpdateObjectRecords', value);
        },
      },
      {
        key: 'canSoftDeleteObjectRecords',
        label: t`Delete Records on ${objectLabel}`,
        value: settingsDraftRoleObjectPermissions.canSoftDeleteObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canSoftDeleteObjectRecords', value);
        },
      },
      {
        key: 'canDestroyObjectRecords',
        label: t`Destroy Records on ${objectLabel}`,
        value: settingsDraftRoleObjectPermissions.canDestroyObjectRecords,
        setValue: (value: boolean | null) => {
          updateObjectPermission('canDestroyObjectRecords', value);
        },
      },
    ];

  return (
    <Section>
      <H2Title
        title={t`Object-Level Permissions`}
        description={t`Ability to interact with this specific object`}
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
