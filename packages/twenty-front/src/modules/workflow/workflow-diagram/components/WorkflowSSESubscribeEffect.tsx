import { useCallback } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';

export const WorkflowSSESubscribeEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const queryId = `workflow-versions-for-workflow-${workflowId}`;

  const setShouldWorkflowRefetchRequest = useSetFamilyRecoilStateV2(
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

  const handleWorkflowVersionCreateOne = useCallback(() => {
    setShouldWorkflowRefetchRequest(true);
  }, [setShouldWorkflowRefetchRequest]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleWorkflowVersionCreateOne,
    objectMetadataItemId: workflowVersionMetadataItem.id,
    operationTypes: ['create-one'],
  });

  return null;
};
