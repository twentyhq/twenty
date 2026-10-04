import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { SettingsAgentDetailSkeletonLoader } from '~/pages/settings/ai/components/SettingsAgentDetailSkeletonLoader';
import { SettingsAgentFormContent } from '~/pages/settings/ai/components/SettingsAgentFormContent';
import { SettingsAgentTurnDetail } from '~/pages/settings/ai/components/SettingsAgentTurnDetail';
import { useNavigateToNotFoundOnLoadFailure } from '~/pages/settings/ai/hooks/useNavigateToNotFoundOnLoadFailure';

type AgentCoreObjectShowPageProps = CoreObjectShowPageProps;

export const AgentCoreObjectShowPage = ({
  objectRecordId: agentId,
}: AgentCoreObjectShowPageProps) => {
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
            <SettingsAgentDetailSkeletonLoader />
          </Section.Root>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  if (isDefined(turnId)) {
    return <SettingsAgentTurnDetail agent={agent} turnId={turnId} />;
  }

  return <SettingsAgentFormContent key={agent.id} agent={agent} />;
};
