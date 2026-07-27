import { useCallback } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';

export const WorkflowSSESubscribeEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const queryId = `workflow-versions-for-workflow-${workflowId}`;

  const setShouldWorkflowRefetchRequest = useSetAtomFamilyState(
    shouldWorkflowRefetchRequestFamilyState,
    workflowId,
  );

  const { objectMetadataItem: workflowVersionMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      variables: {
        filter: {
          workflowId: { eq: workflowId },
        },
      },
    },
  });

  const requestWorkflowRefetch = useCallback(() => {
    setShouldWorkflowRefetchRequest(true);
  }, [setShouldWorkflowRefetchRequest]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: requestWorkflowRefetch,
    objectMetadataItemId: workflowVersionMetadataItem.id,
    operationTypes: ['create-one'],
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: requestWorkflowRefetch,
  });

  return null;
};
