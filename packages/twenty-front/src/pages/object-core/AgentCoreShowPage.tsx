import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams, useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { CoreAgentDetailSkeletonLoader } from '@/object-core/agents/components/CoreAgentDetailSkeletonLoader';
import { CoreAgentFormContent } from '@/object-core/agents/components/CoreAgentFormContent';
import { CoreAgentTurnDetail } from '@/object-core/agents/components/CoreAgentTurnDetail';
import { useNavigateToNotFoundOnLoadFailure } from '~/pages/settings/ai/hooks/useNavigateToNotFoundOnLoadFailure';

export const AgentCoreShowPage = () => {
  const { agentId = '' } = useParams<{ agentId: string }>();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const [searchParams] = useSearchParams();
  const turnId = searchParams.get('turn');

  const { data, loading, error } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId },
  });

  const agent = data?.findOneAgent;
  const hasFailedToLoad = !loading && !isDefined(agent);

  useNavigateToNotFoundOnLoadFailure({
    hasFailedToLoad,
    error,
    notFoundMessage: t`Agent not found`,
  });

  if (hasFailedToLoad) {
    return null;
  }

  if (!isDefined(agent)) {
    const AgentIcon = getIcon('IconLego');

    return (
      <SettingsPageLayout
        title={t`Agent`}
        icon={
          <AgentIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        links={getCoreAgentBreadcrumbLinks()}
      >
        <SettingsPageContainer>
          <Section.Root>
            <CoreAgentDetailSkeletonLoader />
          </Section.Root>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  if (isDefined(turnId)) {
    return <CoreAgentTurnDetail agent={agent} turnId={turnId} />;
  }

  return <CoreAgentFormContent key={agent.id} agent={agent} />;
};
