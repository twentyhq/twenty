import { useQuery } from '@apollo/client/react';
import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

export const WorkflowWorkspaceShowPageRedirect = ({
  workspaceWorkflowId,
  children,
}: {
  workspaceWorkflowId: string;
  children: React.ReactNode;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    variables: { workspaceWorkflowId },
  });

  if (loading) {
    return null;
  }

  const coreWorkflowId = data?.coreWorkflow?.id;

  if (isDefined(coreWorkflowId)) {
    return (
      <Navigate
        replace
        to={getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId })}
      />
    );
  }

  return children;
};
