import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useListenToObjectRecordOperationBrowserEvent } from '@/object-record/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/object-record/types/ObjectRecordOperationBrowserEventDetail';
import { useListenToObjectRecordEventsForQuery } from '@/sse-db-event/hooks/useListenToObjectRecordEventsForQuery';
import { workflowRefetchRequestedFamilyState } from '@/workflow/states/workflowRefetchRequestedFamilyState';

export const WorkflowSSESubscribeEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const queryId = `workflow-versions-for-workflow-${workflowId}`;

  const setWorkflowRefetchRequested = useSetRecoilState(
    workflowRefetchRequestedFamilyState(workflowId),
  );

  const { objectMetadataItem: workflowVersionMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  useListenToObjectRecordEventsForQuery({
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

  const handleWorkflowVersionCreateOne = useCallback(
    (detail: ObjectRecordOperationBrowserEventDetail) => {
      const { operation } = detail;

      if (operation.type === 'create-one') {
        setWorkflowRefetchRequested(true);
      }
    },
    [setWorkflowRefetchRequested],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleWorkflowVersionCreateOne,
    objectMetadataItemId: workflowVersionMetadataItem.id,
    operationTypes: ['create-one'],
  });

  return null;
};
