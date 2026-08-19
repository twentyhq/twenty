import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_CORE_WORKFLOWS } from '@/object-core/workflows/graphql/queries/getCoreWorkflows';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

export const useCoreWorkflows = ({ skip }: { skip: boolean }) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery<{ coreWorkflows: CoreWorkflow[] }>(
    GET_CORE_WORKFLOWS,
    { client: apolloCoreClient, skip },
  );

  return { coreWorkflows: data?.coreWorkflows ?? [], loading };
};
