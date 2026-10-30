import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconEdit, IconTool } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { CoreAgentSectionList } from '@/object-core/agents/components/CoreAgentSectionList';
import { CoreAgentSectionBody } from '@/object-core/agents/components/CoreAgentSectionBody';
import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentSectionListItem } from '@/object-core/agents/types/CoreAgentSectionListItem';
import { getCoreAgentEnabledToolFlags } from '@/object-core/agents/utils/getCoreAgentEnabledToolFlags';
import { getRoleWithCoreAgentToolFlags } from '@/object-core/agents/utils/getRoleWithCoreAgentToolFlags';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';

type CoreAgentToolsSectionProps = {
  agent: CoreAgent;
  isReadOnly: boolean;
};

export const CoreAgentToolsSection = ({
  agent,
  isReadOnly,
}: CoreAgentToolsSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { openCoreAgentSidePanelPage } = useOpenCoreAgentSidePanelPage();
  const { role, updateRole, canEditRole } = useCoreAgentRole(agent);
  const toolPermissions = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  const enabledToolFlags = getCoreAgentEnabledToolFlags(role);
  const canRemoveTool = !isReadOnly && canEditRole;

  const removeTool = (toolFlag: string) =>
    updateRole((currentRole) =>
      getRoleWithCoreAgentToolFlags({
        role: currentRole,
        enabledToolFlags: getCoreAgentEnabledToolFlags(currentRole).filter(
          (enabledToolFlag) => enabledToolFlag !== toolFlag,
        ),
      }),
    );

  const items: CoreAgentSectionListItem[] = toolPermissions
    .filter((toolPermission) => enabledToolFlags.includes(toolPermission.key))
    .map((toolPermission) => {
      const toolName = toolPermission.name;

      return {
        id: toolPermission.key,
        label: toolName,
        icon: <toolPermission.Icon size={theme.icon.size.md} />,
        remove: canRemoveTool
          ? {
              label: t`Remove ${toolName}`,
              onClick: () => removeTool(toolPermission.key),
            }
          : undefined,
      };
    });

  return (
    <Section.Root>
      <Section.Header
        title={t`Tools`}
        description={t`What tools can this agent use for its mission`}
      />
      <CoreAgentSectionBody>
        <CoreAgentSectionList
          items={items}
          emptyMessage={t`This agent can't use any tools yet.`}
        />
        {!isReadOnly && (
          <Button
            variant="outline"
            startIcon={<IconEdit />}
            onClick={() =>
              openCoreAgentSidePanelPage({
                agentId: agent.id,
                page: SidePanelPages.AgentCoreTools,
                pageTitle: t`Edit tools`,
                pageIcon: IconTool,
              })
            }
          >{t`Edit tools`}</Button>
        )}
      </CoreAgentSectionBody>
    </Section.Root>
  );
};
