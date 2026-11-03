import { CoreAgentSettingsPermissionsSummary } from '@/object-core/agents/components/CoreAgentSettingsPermissionsSummary';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useCoreAgentToolPermissions } from '@/object-core/agents/hooks/useCoreAgentToolPermissions';
import { useOpenCoreAgentTools } from '@/object-core/agents/hooks/useOpenCoreAgentTools';
import { useUpdateCoreAgentTool } from '@/object-core/agents/hooks/useUpdateCoreAgentTool';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentToolsSectionProps = { agentId?: string };

export const CoreAgentToolsSection = ({
  agentId,
}: CoreAgentToolsSectionProps) => {
  const { t } = useLingui();
  const { session, draftRole, isRoleEditable, canReadRoles } =
    useCoreAgentEditStatus({ agentId });
  const permissions = useCoreAgentToolPermissions();
  const { openCoreAgentTools } = useOpenCoreAgentTools({ agentId });
  const { updateCoreAgentTool } = useUpdateCoreAgentTool({ agentId });
  const enabledTools = permissions.filter(
    (permission) =>
      draftRole.canAccessAllTools ||
      draftRole.permissionFlags?.some(({ flag }) => flag === permission.key),
  );
  const hasLoadedRole =
    canReadRoles &&
    (!isDefined(session?.roleId) || draftRole.id === session.roleId);

  return (
    <Section.Root>
      <Section.Header
        title={t`Tools`}
        actions={
          <Button
            size="sm"
            variant="outline"
            disabled={!isDefined(session)}
            onClick={openCoreAgentTools}
          >{t`Configure tools`}</Button>
        }
      />
      {!hasLoadedRole ? (
        <Text color="secondary">{t`Permission details are unavailable until the assigned role can be loaded.`}</Text>
      ) : (
        <>
          {!isNonEmptyArray(enabledTools) && (
            <Text color="secondary">{t`No tools enabled`}</Text>
          )}
          {enabledTools.map((permission) => (
            <ListItem
              key={permission.key}
              startIcon={<permission.Icon />}
              description={permission.description}
              actionsVisibility="always"
              actions={
                <LightIconButton
                  aria-label={t`Remove ${permission.name}`}
                  disabled={!isRoleEditable}
                  onClick={() =>
                    updateCoreAgentTool({
                      toolKey: permission.key,
                      isEnabled: false,
                    })
                  }
                >
                  <IconTrash />
                </LightIconButton>
              }
            >
              {permission.name}
            </ListItem>
          ))}
          <CoreAgentSettingsPermissionsSummary agentId={agentId} />
        </>
      )}
    </Section.Root>
  );
};
