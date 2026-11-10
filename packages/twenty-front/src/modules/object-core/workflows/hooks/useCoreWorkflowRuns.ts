import { useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { useListenToCoreWorkflowRunEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowRunEvents';
import { type CoreWorkflowRunListItem } from '@/object-core/workflows/types/CoreWorkflowRunListItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const RUNS_PAGE_SIZE = 50;

export const useCoreWorkflowRuns = (coreWorkflowId: string) => {
  const runsFilter = useMemo(
    () => ({ coreWorkflowId: { eq: coreWorkflowId } }),
    [coreWorkflowId],
  );

  const {
    records,
    loading,
    error,
    hasNextPage,
    fetchMoreRecords,
    refetch: refetchRuns,
  } = useFindManyRecords<CoreWorkflowRunListItem>({
    objectNameSingular: StandardObjectNameSingular.WorkflowRun,
    filter: runsFilter,
    orderBy: [{ createdAt: 'DescNullsLast' }],
    limit: RUNS_PAGE_SIZE,
    recordGqlFields: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      startedAt: true,
      endedAt: true,
      coreWorkflowVersionId: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  useListenToCoreWorkflowRunEvents({
    coreWorkflowIds: [coreWorkflowId],
    queryId: `core-workflow-runs-${coreWorkflowId}`,
    onRunsChanged: refetchRuns,
  });

  return {
    runs: records,
    loading,
    error,
    hasNextPage,
    fetchMoreRuns: fetchMoreRecords,
  };
};
