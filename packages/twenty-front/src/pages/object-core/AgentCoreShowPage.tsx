import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { CoreAgentFormContent } from '@/object-core/agents/components/CoreAgentFormContent';
import { useListenToCoreAgentEvents } from '@/object-core/agents/hooks/useListenToCoreAgentEvents';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';
import { useNavigateToNotFoundOnLoadFailure } from '~/pages/settings/ai/hooks/useNavigateToNotFoundOnLoadFailure';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { logError } from '~/utils/logError';

export const AgentCoreShowPage = () => {
  const { t } = useLingui();
  const { agentId = '' } = useParams<{ agentId: string }>();

  const { data, loading, error, refetch } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId },
  });

  const refetchCoreAgent = useCallback(() => {
    void refetch().catch(logError);
  }, [refetch]);

  useListenToCoreAgentEvents({
    coreAgentId: agentId,
    refetch: refetchCoreAgent,
  });

  const agent = data?.findOneAgent;
  const hasFailedToLoad =
    !loading && (!isDefined(agent) || isGraphqlErrorOfType(error, 'NOT_FOUND'));

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
