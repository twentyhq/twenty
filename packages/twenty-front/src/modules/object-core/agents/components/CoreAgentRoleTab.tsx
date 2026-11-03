import { CoreAgentToolsSection } from '@/object-core/agents/components/CoreAgentToolsSection';
import { CoreAgentDataAccessSection } from '@/object-core/agents/components/CoreAgentDataAccessSection';
import { CoreAgentRolePolicy } from '@/object-core/agents/components/CoreAgentRolePolicy';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

export const CoreAgentRoleTab = () => {
  const { session, roleId, canReadRoles } = useCoreAgentEditStatus();

  return (
    <Section.Root>
      <CoreAgentRolePolicy />
      <CoreAgentDataAccessSection />
      {canReadRoles && isDefined(session?.roleId) && (
        <>
          <SettingsRoleDraftSyncEffect roleId={roleId} />
          <CoreAgentToolsSection />
        </>
      )}
    </Section.Root>
  );
};
