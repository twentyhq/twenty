import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsActionSwitchCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsActionSwitchCard';
import { useSetObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSetObjectActionPermissions';
import { getActionPermissionsAfterToggle } from '@/settings/roles/role-permissions/objects-permissions/utils/getActionPermissionsAfterToggle';
import { getEffectiveObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getEffectiveObjectActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';

type SettingsRolePermissionsObjectLevelObjectFormObjectLevelProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevel = ({
  roleId,
  objectMetadataItem,
}: SettingsRolePermissionsObjectLevelObjectFormObjectLevelProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { setObjectActionPermissions } = useSetObjectActionPermissions(roleId);

  const actionPermissions = getEffectiveObjectActionPermissions({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const objectLabelPlural = objectMetadataItem.labelPlural;
  const objectLabelSingular = objectMetadataItem.labelSingular;
  const roleLabel = settingsDraftRole.label;

  return (
    <Section.Root>
      <Section.Header
        title={t`All ${objectLabelPlural}`}
        description={t`What ${roleLabel} can do on every ${objectLabelSingular}.`}
      />
      <SettingsRolePermissionsActionSwitchCard
        actionPermissions={actionPermissions}
        objectLabelPlural={objectLabelPlural}
        disabled={!settingsDraftRole.isEditable}
        onToggle={({ permissionKey, value }) =>
          setObjectActionPermissions({
            objectMetadataId: objectMetadataItem.id,
            actionPermissions: getActionPermissionsAfterToggle({
              actionPermissions,
              permissionKey,
              value,
            }),
          })
        }
      />
    </Section.Root>
  );
};
