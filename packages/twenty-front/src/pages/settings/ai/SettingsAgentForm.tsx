import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { SettingsAgentDetailSkeletonLoader } from '~/pages/settings/ai/components/SettingsAgentDetailSkeletonLoader';
import { SettingsAgentFormContent } from '~/pages/settings/ai/components/SettingsAgentFormContent';
import { useNavigateToNotFoundOnLoadFailure } from '~/pages/settings/ai/hooks/useNavigateToNotFoundOnLoadFailure';
import { getSettingsAiBreadcrumbLinks } from '~/pages/settings/ai/utils/getSettingsAiBreadcrumbLinks';

export const SettingsAgentForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { agentId = '' } = useParams<{ agentId: string }>();

  const isCreateMode = mode === 'create';

  const { data, loading, error } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId },
    skip: isCreateMode || !agentId,
  });

  const agent = data?.findOneAgent;
  const hasFailedToLoad = !isCreateMode && !loading && !isDefined(agent);

  useNavigateToNotFoundOnLoadFailure({
    hasFailedToLoad,
    error,
    notFoundMessage: t`Agent not found`,
  });

  if (isCreateMode) {
    return <SettingsAgentFormContent />;
  }

  if (!isDefined(agent)) {
    const AgentIcon = getIcon('IconLego');

    return (
      <SettingsPageLayout
        title={t`Agent`}
        icon={
          <AgentIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        links={getSettingsAiBreadcrumbLinks(t`Agent`)}
      >
        <SettingsPageContainer>
          <Section>
            <SettingsAgentDetailSkeletonLoader />
          </Section>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  return <SettingsAgentFormContent key={agent.id} agent={agent} />;
};
