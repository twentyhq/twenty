import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_CORE_WORKFLOWS } from '@/workflow-core/graphql/queries/getCoreWorkflows';
import { type CoreWorkflow } from '@/workflow-core/types/CoreWorkflow';

export const useCoreWorkflows = ({ skip }: { skip: boolean }) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery<{ coreWorkflows: CoreWorkflow[] }>(
    GET_CORE_WORKFLOWS,
    { client: apolloCoreClient, skip },
  );

  return { coreWorkflows: data?.coreWorkflows ?? [], loading };
};
