import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { usePrepareCoreAgentRole } from '@/object-core/agents/hooks/usePrepareCoreAgentRole';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { Section } from 'twenty-ui/components/layout';
import { IconExternalLink } from 'twenty-ui/icon';

type CoreAgentRolePolicyProps = { agentId?: string };

export const CoreAgentRolePolicy = ({ agentId }: CoreAgentRolePolicyProps) => {
  const { t } = useLingui();
  const {
    session,
    persistedRole,
    isRoleEditable,
    canPrepareRole,
    canReadRoles,
    isEditable,
  } = useCoreAgentEditStatus({ agentId });
  const { prepareCoreAgentRole } = usePrepareCoreAgentRole({ agentId });
  const settingsRolesIsLoading = useAtomStateValue(settingsRolesIsLoadingState);
  const persistedRoleId = session?.agent.roleId;
  const isRoleUnavailable =
    isDefined(persistedRoleId) && persistedRole?.id !== persistedRoleId;
  const message = (() => {
    if (!isDefined(session)) {
      return t`Loading agent permissions…`;
    }
    if (!canReadRoles) {
      return t`You need permission to manage roles to inspect or edit this agent's permissions.`;
    }
    if (isRoleUnavailable && settingsRolesIsLoading) {
      return t`Loading permissions…`;
    }
    if (isRoleUnavailable) {
      return t`The assigned role could not be loaded. Open it in Roles to inspect its permissions.`;
    }
    if (!isDefined(session?.roleId)) {
      return t`This agent has no role and no data access. Prepare permissions to create a private role when settings are saved.`;
    }
    if (!isEditable) {
      return t`This agent is read-only or you do not have permission to edit it.`;
    }
    if (
      persistedRole?.canBeAssignedToUsers ||
      persistedRole?.canBeAssignedToApiKeys
    ) {
      return t`Roles that can be assigned to users or API keys are read-only here.`;
    }
    if (persistedRole?.agents.some((agent) => agent.id !== session.agent.id)) {
      return t`This role is shared with another agent and is read-only here.`;
    }
    if (!isRoleEditable) {
      return t`This role is read-only here. Editing requires an editable private role owned by this workspace.`;
    }
    return t`Permission changes are saved or discarded with the agent settings.`;
  })();

  return (
    <Section.Root>
      <Text color="secondary">{message}</Text>
      {canPrepareRole && (
        <Button
          variant="outline"
          onClick={prepareCoreAgentRole}
        >{t`Prepare permissions`}</Button>
      )}
      {canReadRoles && isDefined(persistedRoleId) && (
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          startIcon={<IconExternalLink />}
          render={
            <Link
              to={getSettingsPath(SettingsPath.RoleDetail, {
                roleId: persistedRoleId,
              })}
              target="_blank"
              rel="noreferrer"
            />
          }
        >{t`Open in Roles`}</Button>
      )}
    </Section.Root>
  );
};
