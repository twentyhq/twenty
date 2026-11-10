import { useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

const RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS = 1000;

type UseListenToCoreWorkflowRunEventsArgs = {
  coreWorkflowId: string;
  queryId: string;
  onRunsChanged: () => void;
};

export const useListenToCoreWorkflowRunEvents = ({
  coreWorkflowId,
  queryId,
  onRunsChanged,
}: UseListenToCoreWorkflowRunEventsArgs) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.WorkflowRun,
  });

  // Runs change step by step while they execute, so bursts of events collapse into one refetch
  const onRunsChangedDebounced = useDebouncedCallback(
    onRunsChanged,
    RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS,
  );

  const runsOperationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
      variables: { filter: { coreWorkflowId: { eq: coreWorkflowId } } },
    }),
    [coreWorkflowId],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature: runsOperationSignature,
    onSseReconnected: onRunsChangedDebounced,
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: onRunsChangedDebounced,
    objectMetadataItemId: objectMetadataItem.id,
  });
};
