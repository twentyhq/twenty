import { subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type CoreWorkflowRunListItem } from '@/object-core/workflows/types/CoreWorkflowRunListItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

const RUNS_PAGE_SIZE = 50;

const RUN_COUNT_WINDOW_IN_DAYS = 14;

const RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS = 1000;

export const useCoreWorkflowRuns = (coreWorkflowId: string) => {
  // Fixed at mount so re-renders do not change the count query's variables
  const [runCountWindowStart] = useState(() =>
    subDays(new Date(), RUN_COUNT_WINDOW_IN_DAYS).toISOString(),
  );

  const {
    objectMetadataItem,
    records,
    loading,
    error,
    hasNextPage,
    fetchMoreRecords,
    refetch: refetchRuns,
  } = useFindManyRecords<CoreWorkflowRunListItem>({
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

  const { totalCount: runCountLast14Days, refetch: refetchRunCount } =
    useFindManyRecords({
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

  // Runs change step by step while they execute, so bursts of events collapse into one refetch
  const refetchRunsAndCount = useDebouncedCallback(() => {
    void refetchRuns();
    void refetchRunCount();
  }, RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS);

  const runsOperationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
      variables: { filter: { coreWorkflowId: { eq: coreWorkflowId } } },
    }),
    [coreWorkflowId],
  );

  useListenToEventsForQuery({
    queryId: `core-workflow-runs-${coreWorkflowId}`,
    operationSignature: runsOperationSignature,
    onSseReconnected: refetchRunsAndCount,
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchRunsAndCount,
    objectMetadataItemId: objectMetadataItem.id,
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
