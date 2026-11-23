import { useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

const RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS = 1000;
const RUN_EVENTS_REFETCH_MAX_WAIT_IN_MS = 5000;

type UseListenToCoreWorkflowRunEventsArgs = {
  coreWorkflowIds: string[];
  queryId: string;
  onRunsChanged: () => void;
};

export const useListenToCoreWorkflowRunEvents = ({
  coreWorkflowIds,
  queryId,
  onRunsChanged,
}: UseListenToCoreWorkflowRunEventsArgs) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.WorkflowRun,
  });

  // Runs change step by step while they execute, so bursts collapse into one refetch, at least every few seconds
  const onRunsChangedDebounced = useDebouncedCallback(
    () => onRunsChanged(),
    RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS,
    { maxWait: RUN_EVENTS_REFETCH_MAX_WAIT_IN_MS },
  );

  const coreWorkflowIdsKey = coreWorkflowIds.join(',');

  const runsOperationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
      variables: {
        filter: { coreWorkflowId: { in: coreWorkflowIdsKey.split(',') } },
      },
    }),
    [coreWorkflowIdsKey],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature: runsOperationSignature,
    skip: !isNonEmptyArray(coreWorkflowIds),
    onSseReconnected: onRunsChangedDebounced,
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: onRunsChangedDebounced,
    objectMetadataItemId: objectMetadataItem.id,
  });
};
