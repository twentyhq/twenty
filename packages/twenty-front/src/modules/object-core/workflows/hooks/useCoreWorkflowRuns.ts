import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type CoreWorkflowRunListItem } from '@/object-core/workflows/types/CoreWorkflowRunListItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { GetCoreWorkflowRunSummaryDocument } from '~/generated/graphql';

const RUNS_PAGE_SIZE = 50;

const RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS = 1000;

export const useCoreWorkflowRuns = (coreWorkflowId: string) => {
  const apolloCoreClient = useApolloCoreClient();

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

  const { data: runSummaryData, refetch: refetchRunSummary } = useQuery(
    GetCoreWorkflowRunSummaryDocument,
    {
      client: apolloCoreClient,
      variables: { coreWorkflowId },
      fetchPolicy: 'cache-and-network',
    },
  );

  // Runs change step by step while they execute, so bursts of events collapse into one refetch
  const refetchRunsAndSummary = useDebouncedCallback(() => {
    void refetchRuns();
    void refetchRunSummary();
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
    onSseReconnected: refetchRunsAndSummary,
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchRunsAndSummary,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return {
    runs: records,
    runSummary: runSummaryData?.coreWorkflowRunSummary ?? null,
    loading,
    error,
    hasNextPage,
    fetchMoreRuns: fetchMoreRecords,
  };
};
