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

  // Subset of the workflow query the page already runs, so the version ids
  // are served from the Apollo cache without an extra request.
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

  // Creations cover new draft versions; updates cover step and trigger edits
  // on the current draft (the AI chat, another user, another tab). Local
  // workflow mutations do not dispatch these events, only SSE deliveries do,
  // and refetching on an own-persist echo reseeds the diagram with the state
  // it already shows.
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
