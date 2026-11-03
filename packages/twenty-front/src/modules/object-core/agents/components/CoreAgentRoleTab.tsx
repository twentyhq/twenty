import { CoreAgentDataAccessSection } from '@/object-core/agents/components/CoreAgentDataAccessSection';
import { CoreAgentRolePolicy } from '@/object-core/agents/components/CoreAgentRolePolicy';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

type CoreAgentRoleTabProps = { disabled: boolean };

export const CoreAgentRoleTab = ({ disabled }: CoreAgentRoleTabProps) => {
  const { session, roleId, isRoleEditable, canReadRoles } =
    useCoreAgentEditStatus();

  return (
    <Section.Root>
      <CoreAgentRolePolicy />
      <CoreAgentDataAccessSection />
      {canReadRoles && isDefined(session?.roleId) && (
        <>
          <SettingsRoleDraftSyncEffect roleId={roleId} />
          <SettingsRolePermissionsSettingsSection
            roleId={roleId}
            isEditable={!disabled && isRoleEditable}
          />
          <SettingsRolePermissionsToolSection
            roleId={roleId}
            isEditable={!disabled && isRoleEditable}
          />
        </>
      )}
    </Section.Root>
  );
};
