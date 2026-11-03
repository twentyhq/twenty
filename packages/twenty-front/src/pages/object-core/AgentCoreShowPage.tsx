import { CoreAgentEditingScope } from '@/object-core/agents/components/CoreAgentEditingScope';
import { CoreAgentMetadataEventsEffect } from '@/object-core/agents/components/CoreAgentMetadataEventsEffect';
import { CoreAgentFormContent } from '@/object-core/agents/components/CoreAgentFormContent';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { isNonEmptyString } from '@sniptt/guards';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

export const AgentCoreShowPage = () => {
  const { agentId = '' } = useParams<{ agentId: string }>();
  const { data, loading, error, refetch } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId },
    skip: !isNonEmptyString(agentId),
  });
  const metadataEffect = isNonEmptyString(agentId) ? (
    <CoreAgentMetadataEventsEffect agentId={agentId} />
  ) : null;
  const agent = data?.findOneAgent;

  if (isDefined(agent) && agent.id === agentId) {
    return (
      <CoreAgentEditingScope key={agent.id} agentId={agent.id}>
        {metadataEffect}
        <CoreAgentFormContent agent={agent} />
      </CoreAgentEditingScope>
    );
  }

  return (
    <>
      {metadataEffect}
      <PageCardLayout
        header={<PageCardHeader links={getCoreAgentBreadcrumbLinks()} />}
      >
        {loading ? (
          <PageContentSkeletonLoader />
        ) : (
          <WorkspaceRouteUnavailable>
            {isDefined(error)
              ? t`Could not load this agent.`
              : t`Agent not found.`}
            {isDefined(error) && (
              <Button
                variant="outline"
                onClick={() => void refetch().catch(logError)}
              >{t`Retry`}</Button>
            )}
          </WorkspaceRouteUnavailable>
        )}
      </PageCardLayout>
    </>
  );
};
