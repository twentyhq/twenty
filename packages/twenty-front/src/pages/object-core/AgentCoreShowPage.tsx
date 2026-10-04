import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { CoreAgentModelCell } from '@/object-core/agents/components/CoreAgentModelCell';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  white-space: pre-wrap;
`;

const StyledPrompt = styled(StyledText)`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

export const AgentCoreShowPage = () => {
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();
  const { agentId = '' } = useParams<{ agentId: string }>();

  const canEditAgent = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);

  const { data, loading, error } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId },
    skip: agentId === '',
  });

  const agent = data?.findOneAgent;

  if (loading && !isDefined(agent)) {
    return <PageContentSkeletonLoader />;
  }

  if (isDefined(error) || !isDefined(agent)) {
    return (
      <WorkspaceRouteUnavailable>{t`Agent not found.`}</WorkspaceRouteUnavailable>
    );
  }

  return (
    <>
      <PageTitle title={agent.label} />
      <PageCardLayout
        header={
          <PageCardHeader
            links={[
              {
                children: t`Agents`,
                href: getAppPath(AppPath.AgentIndexPage),
              },
              {
                children: agent.label,
              },
            ]}
            actionButton={
              <>
                {canEditAgent && (
                  <Button
                    startIcon={<IconSettings size={theme.icon.size.sm} />}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigateSettings(SettingsPath.AiAgentDetail, {
                        agentId: agent.id,
                      })
                    }
                  >
                    {t`Settings`}
                  </Button>
                )}
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <StyledContent>
          {isDefined(agent.description) && agent.description !== '' && (
            <Section.Root>
              <Section.Header title={t`Description`} />
              <StyledText>{agent.description}</StyledText>
            </Section.Root>
          )}
          <Section.Root>
            <Section.Header title={t`Model`} />
            <CoreAgentModelCell modelId={agent.modelId} />
          </Section.Root>
          <Section.Root>
            <Section.Header title={t`Instructions`} />
            <StyledPrompt>{agent.prompt}</StyledPrompt>
          </Section.Root>
        </StyledContent>
      </PageCardLayout>
    </>
  );
};
