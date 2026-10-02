import { useCallback } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

  const requestWorkflowRefetch = useCallback(() => {
    setShouldWorkflowRefetchRequest(true);
  }, [setShouldWorkflowRefetchRequest]);

  // Subset of the page's workflow query, so version ids come from the Apollo cache
  const { record: workflowWithVersionIds } = useFindOneRecord<{
    __typename: string;
    id: string;
    versions: Array<{ id: string }>;
  }>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: workflowId,
    recordGqlFields: {
      id: true,
      versions: {
        id: true,
      },
    },
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
    onSseReconnected: requestWorkflowRefetch,
  });

  // Local mutations do not dispatch these events, so this only follows remote edits (AI chat, other users or tabs)
  const handleWorkflowVersionOperationBrowserEvent = useCallback(
    (detail: ObjectRecordOperationBrowserEventDetail) => {
      if (detail.operation.type === 'create-one') {
        requestWorkflowRefetch();

        return;
      }

      const updateInputs =
        detail.operation.type === 'update-one'
          ? [detail.operation.result.updateInput]
          : detail.operation.type === 'update-many'
            ? detail.operation.result.updateInputs
            : [];

      const workflowVersionIds = workflowWithVersionIds?.versions?.map(
        (version) => version.id,
      );

      // Without the version mapping, refetch rather than risk a stale diagram.
      if (!isDefined(workflowVersionIds)) {
        requestWorkflowRefetch();

        return;
      }

      if (
        updateInputs.some((updateInput) =>
          workflowVersionIds.includes(updateInput.recordId),
        )
      ) {
        requestWorkflowRefetch();
      }
    },
    [workflowWithVersionIds, requestWorkflowRefetch],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent:
      handleWorkflowVersionOperationBrowserEvent,
    objectMetadataItemId: workflowVersionMetadataItem.id,
    operationTypes: ['create-one', 'update-one', 'update-many'],
  });

  return null;
};
