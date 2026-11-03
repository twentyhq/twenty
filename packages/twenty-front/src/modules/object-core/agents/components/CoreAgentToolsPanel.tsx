import { CoreAgentPermissionsPanel } from '@/object-core/agents/components/CoreAgentPermissionsPanel';
import { CoreAgentSettingsPermissionsSummary } from '@/object-core/agents/components/CoreAgentSettingsPermissionsSummary';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useCoreAgentToolPermissions } from '@/object-core/agents/hooks/useCoreAgentToolPermissions';
import { useUpdateCoreAgentTool } from '@/object-core/agents/hooks/useUpdateCoreAgentTool';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { SettingsRow } from 'twenty-ui/components/settings';
import { IconSearch } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentToolsPanelProps = { agentId: string };

export const CoreAgentToolsPanel = ({ agentId }: CoreAgentToolsPanelProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const { session, draftRole, isRoleEditable, canReadRoles } =
    useCoreAgentEditStatus({ agentId });
  const permissions = useCoreAgentToolPermissions();
  const { updateCoreAgentTool } = useUpdateCoreAgentTool({ agentId });
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const matchingPermissions = permissions.filter((permission) =>
    `${permission.name} ${permission.description}`
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
  const hasRole =
    canReadRoles &&
    isDefined(session?.roleId) &&
    draftRole.id === session.roleId;

  return (
    <CoreAgentPermissionsPanel agentId={agentId}>
      {hasRole && (
        <>
          {draftRole.canAccessAllTools && (
            <Text color="secondary">{t`All tools are allowed. Turning off one tool keeps the other currently available tools.`}</Text>
          )}
          <SettingsTextInput
            instanceId={`agent-tools-search-${agentId}`}
            label={t`Tools`}
            placeholder={t`Search tools`}
            LeftIcon={IconSearch}
            value={search}
            onChange={setSearch}
            fullWidth
          />
          {!isNonEmptyArray(matchingPermissions) && (
            <Text color="secondary">{t`No matching tools`}</Text>
          )}
          {matchingPermissions.map((permission) => (
            <SettingsRow
              key={permission.key}
              startElement={<permission.Icon />}
              description={permission.description}
              checked={
                draftRole.canAccessAllTools ||
                draftRole.permissionFlags?.some(
                  ({ flag }) => flag === permission.key,
                ) ||
                false
              }
              disabled={!isRoleEditable}
              onCheckedChange={(isEnabled) =>
                updateCoreAgentTool({ toolKey: permission.key, isEnabled })
              }
            >
              {permission.name}
            </SettingsRow>
          ))}
          <CoreAgentSettingsPermissionsSummary agentId={agentId} />
        </>
      )}
    </CoreAgentPermissionsPanel>
  );
};
