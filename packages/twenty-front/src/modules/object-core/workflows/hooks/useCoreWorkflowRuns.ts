import { subDays } from 'date-fns';
import { useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { type CoreWorkflowRunListItem } from '@/object-core/workflows/types/CoreWorkflowRunListItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const RUNS_PAGE_SIZE = 50;

const RUN_COUNT_WINDOW_IN_DAYS = 14;

export const useCoreWorkflowRuns = (coreWorkflowId: string) => {
  // Fixed at mount so re-renders do not change the count query's variables
  const [runCountWindowStart] = useState(() =>
    subDays(new Date(), RUN_COUNT_WINDOW_IN_DAYS).toISOString(),
  );

  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useFindManyRecords<CoreWorkflowRunListItem>({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
      filter: { coreWorkflowId: { eq: coreWorkflowId } },
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

  const { totalCount: runCountLast14Days } = useFindManyRecords({
    objectNameSingular: StandardObjectNameSingular.WorkflowRun,
    filter: {
      and: [
        { coreWorkflowId: { eq: coreWorkflowId } },
        { createdAt: { gte: runCountWindowStart } },
      ],
    },
    limit: 1,
    recordGqlFields: { id: true },
    fetchPolicy: 'cache-and-network',
  });

  return {
    runs: records,
    runCountLast14Days,
    loading,
    error,
    hasNextPage,
    fetchMoreRuns: fetchMoreRecords,
  };
};
