import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { plural, t } from '@lingui/core/macro';

type SettingsRoleSettingsDeleteRoleConfirmationModalSubtitleProps = {
  roleId: string;
};

export const SettingsRoleSettingsDeleteRoleConfirmationModalSubtitle = ({
  roleId,
}: SettingsRoleSettingsDeleteRoleConfirmationModalSubtitleProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const roleName = settingsDraftRole.label;
  const memberCount = settingsDraftRole.workspaceMembers.length;
  const apiKeyCount = settingsDraftRole.apiKeys.length;
  const agentCount = settingsDraftRole.agents.length;

  const segments: string[] = [];

  if (memberCount > 0) {
    segments.push(
      plural(memberCount, {
        one: `${memberCount} member`,
        other: `${memberCount} members`,
      }),
    );
  }

  if (apiKeyCount > 0) {
    segments.push(
      plural(apiKeyCount, {
        one: `${apiKeyCount} API key`,
        other: `${apiKeyCount} API keys`,
      }),
    );
  }

  if (agentCount > 0) {
    segments.push(
      plural(agentCount, {
        one: `${agentCount} agent`,
        other: `${agentCount} agents`,
      }),
    );
  }

  if (segments.length === 0) {
    return (
      <>{t`Confirm deletion of ${roleName} role? This cannot be undone.`}</>
    );
  }

  const reassignSubject =
    segments.length === 1
      ? segments[0]
      : `${segments.slice(0, -1).join(', ')} ${t`and`} ${segments.at(-1)}`;

  return (
    <>{t`Confirm deletion of ${roleName} role? This cannot be undone. ${reassignSubject} will be reassigned to the default role.`}</>
  );
};
