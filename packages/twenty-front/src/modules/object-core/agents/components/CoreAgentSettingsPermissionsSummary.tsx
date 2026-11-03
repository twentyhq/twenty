import { isNonEmptyArray } from 'twenty-shared/utils';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useRolePermissionFlagConfig';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { useLingui } from '@lingui/react/macro';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentSettingsPermissionsSummaryProps = { agentId?: string };

export const CoreAgentSettingsPermissionsSummary = ({
  agentId,
}: CoreAgentSettingsPermissionsSummaryProps) => {
  const { t } = useLingui();
  const { draftRole } = useCoreAgentEditStatus({ agentId });
  const standardPermissionsConfig = useSettingsRolePermissionFlagConfig();
  const settingsPermissions = useRolePermissionFlagConfig({
    permissionType: 'settings',
    standardPermissionsConfig,
  });
  const enabledSettings = settingsPermissions
    .filter((permission) =>
      draftRole.permissionFlags?.some(({ flag }) => flag === permission.key),
    )
    .map(({ name }) => name);

  if (draftRole.canUpdateAllSettings) {
    return <Text color="secondary">{t`Settings access: all settings`}</Text>;
  }

  return isNonEmptyArray(enabledSettings) ? (
    <Text color="secondary">{t`Settings access: ${enabledSettings.join(', ')}`}</Text>
  ) : null;
};
