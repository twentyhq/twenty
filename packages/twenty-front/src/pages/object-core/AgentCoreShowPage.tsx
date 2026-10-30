import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { CoreAgentFormContent } from '@/object-core/agents/components/CoreAgentFormContent';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';
import { useNavigateToNotFoundOnLoadFailure } from '~/pages/settings/ai/hooks/useNavigateToNotFoundOnLoadFailure';

export const AgentCoreShowPage = () => {
  const { agentId = '' } = useParams<{ agentId: string }>();

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
    return <PageContentSkeletonLoader />;
  }

  return <CoreAgentFormContent key={agent.id} agent={agent} />;
};
