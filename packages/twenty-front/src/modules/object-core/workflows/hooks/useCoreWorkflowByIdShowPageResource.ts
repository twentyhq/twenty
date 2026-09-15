import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildCoreWorkflowShowPageRecord } from '@/object-core/workflows/utils/buildCoreWorkflowShowPageRecord';
import { GetCoreWorkflowByIdDocument } from '~/generated/graphql';

export const useCoreWorkflowByIdShowPageResource = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(
    GetCoreWorkflowByIdDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { coreWorkflowId },
    },
  );

  const record = useMemo(
    () => buildCoreWorkflowShowPageRecord(data?.coreWorkflowById),
    [data?.coreWorkflowById],
  );

  return { record, loading, error, refetch };
};
