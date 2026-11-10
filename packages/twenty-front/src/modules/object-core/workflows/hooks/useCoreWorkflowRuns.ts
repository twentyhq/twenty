import { useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type CoreWorkflowRunListItem } from '@/object-core/workflows/types/CoreWorkflowRunListItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

const RUNS_PAGE_SIZE = 50;

const RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS = 1000;

export const useCoreWorkflowRuns = (coreWorkflowId: string) => {
  const runsFilter = useMemo(
    () => ({ coreWorkflowId: { eq: coreWorkflowId } }),
    [coreWorkflowId],
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

  // Runs change step by step while they execute, so bursts of events collapse into one refetch
  const refetchRunsDebounced = useDebouncedCallback(() => {
    void refetchRuns();
  }, RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS);

  const runsOperationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
      variables: { filter: runsFilter },
    }),
    [runsFilter],
  );

  useListenToEventsForQuery({
    queryId: `core-workflow-runs-${coreWorkflowId}`,
    operationSignature: runsOperationSignature,
    onSseReconnected: refetchRunsDebounced,
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchRunsDebounced,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return {
    runs: records,
    loading,
    error,
    hasNextPage,
    fetchMoreRuns: fetchMoreRecords,
  };
};
