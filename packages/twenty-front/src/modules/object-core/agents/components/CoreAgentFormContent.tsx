import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CoreAgentDetailViewInitializationEffect } from '@/object-core/agents/components/CoreAgentDetailViewInitializationEffect';
import { CoreAgentHeaderCommands } from '@/object-core/commands/components/CoreAgentHeaderCommands';
import { CoreAgentCommandOriginProvider } from '@/object-core/commands/components/CoreAgentCommandOriginProvider';
import { CoreAgentDeleteConfirmationModal } from '@/object-core/agents/components/CoreAgentDeleteConfirmationModal';
import { CoreAgentEditSessionEffect } from '@/object-core/agents/components/CoreAgentEditSessionEffect';
import { CoreAgentHeaderActions } from '@/object-core/agents/components/CoreAgentHeaderActions';
import { CoreAgentIdentifierBar } from '@/object-core/agents/components/CoreAgentIdentifierBar';
import { CoreAgentRunsTab } from '@/object-core/agents/components/CoreAgentRunsTab';
import { CoreAgentSettingsContent } from '@/object-core/agents/components/CoreAgentSettingsContent';
import { useCoreAgentDetailView } from '@/object-core/agents/hooks/useCoreAgentDetailView';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledStatus = styled.div`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[6]};
`;
const StyledError = styled(StyledStatus)`
  color: ${themeCssVariables.color.red};
`;
const StyledRuns = styled.div`
  padding: ${themeCssVariables.spacing[6]};
`;

type CoreAgentFormContentProps = { agent: CoreAgent };

export const CoreAgentFormContent = ({ agent }: CoreAgentFormContentProps) => {
  const view = useCoreAgentDetailView({ agentId: agent.id });
  const { session, roleId, isEditable, canReadRoles, error, validationError } =
    useCoreAgentEditStatus({ agentId: agent.id });
  const scrollId = useWorkspaceSurfaceScopedComponentInstanceId(
    `core-agent-content-${agent.id}`,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canReadAgentRuns = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);
  const showRuns = view === 'runs' && isAiChatInboxEnabled && canReadAgentRuns;

  return (
    <CoreAgentCommandOriginProvider
      target={{ type: 'record', agentId: agent.id }}
    >
      <CoreAgentEditSessionEffect agent={agent} />
      <CoreAgentDetailViewInitializationEffect agentId={agent.id} />
      {canReadRoles && <SettingsRolesQueryEffect />}
      {canReadRoles && isDefined(session?.roleId) && (
        <SettingsRoleDraftSyncEffect roleId={roleId} />
      )}
      <PageTitle title={agent.label} />
      <PageCardLayout
        header={
          <PageCardHeader
            links={getCoreAgentBreadcrumbLinks([{ children: agent.label }])}
            actionButton={
              <>
                <CoreAgentHeaderActions agentId={agent.id} />
                <CoreAgentHeaderCommands view="record" />
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <CoreAgentIdentifierBar agent={agent} />
        {isDefined(session) && !isEditable && (
          <StyledStatus>
            <Text color="secondary">{t`This agent is read-only.`}</Text>
          </StyledStatus>
        )}
        {isDefined(error ?? validationError) && (
          <StyledError role="alert">{error ?? validationError}</StyledError>
        )}
        <ScrollWrapper
          componentInstanceId={scrollId}
          defaultEnableXScroll={false}
        >
          {isDefined(session) &&
            (showRuns ? (
              <StyledRuns>
                <Section.Root>
                  <Section.Header title={t`Runs`} />
                  <CoreAgentRunsTab agentId={agent.id} />
                </Section.Root>
              </StyledRuns>
            ) : (
              <CoreAgentSettingsContent agentId={agent.id} />
            ))}
        </ScrollWrapper>
      </PageCardLayout>
      <CoreAgentDeleteConfirmationModal agentId={agent.id} />
    </CoreAgentCommandOriginProvider>
  );
};
