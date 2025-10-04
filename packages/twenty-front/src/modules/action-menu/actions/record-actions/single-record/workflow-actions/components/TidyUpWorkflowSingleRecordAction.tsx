import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { UPDATE_WORKFLOW_VERSION_POSITIONS } from '@/workflow/workflow-version/graphql/mutations/updateWorkflowVersionPositions';
import { useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpdateWorkflowVersionPositionsMutation,
  type UpdateWorkflowVersionPositionsMutationVariables,
  type WorkflowAction,
} from '~/generated-metadata/graphql';

export const TidyUpWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const [mutate] = useMutation<
    UpdateWorkflowVersionPositionsMutation,
    UpdateWorkflowVersionPositionsMutationVariables
  >(UPDATE_WORKFLOW_VERSION_POSITIONS, { client: apolloCoreClient });

  const onClick = async () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    const workflowVersion = workflowWithCurrentVersion.currentVersion;
    const workflowVersionId = workflowVersion.id;

    const diagram = getWorkflowVersionDiagram({
      workflowVersion,
      workflowContext: 'workflow',
    });

    const tidiedUpDiagram = getOrganizedDiagram(diagram);

    const positions = tidiedUpDiagram.nodes.map((node) => ({
      id: node.id,
      position: node.position,
    }));

    await mutate({ variables: { input: { workflowVersionId, positions } } });

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const triggerPosition = positions.find(
      (position) => position.id === 'trigger',
    );

    const updatedTrigger =
      isDefined(triggerPosition) && isDefined(cachedRecord.trigger)
        ? { ...cachedRecord.trigger, position: triggerPosition.position }
        : cachedRecord.trigger;

    const updatedSteps = cachedRecord.steps?.map((step: WorkflowAction) => {
      const stepPosition = positions.find(
        (position) => position.id === step.id,
      );

      if (!isDefined(stepPosition)) {
        return step;
      }

      return { ...step, position: stepPosition.position };
    });

    const newCachedRecord = {
      ...cachedRecord,
      trigger: updatedTrigger,
      steps: updatedSteps,
    };

    const recordGqlFields = {
      trigger: true,
      steps: true,
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: newCachedRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    });
  };

  return <Action onClick={onClick} />;
};
