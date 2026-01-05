import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpdateWorkflowVersionPositionsMutation,
  type UpdateWorkflowVersionPositionsMutationVariables,
} from '~/generated-metadata/graphql';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { UPDATE_WORKFLOW_VERSION_POSITIONS } from '@/workflow/workflow-version/graphql/mutations/updateWorkflowVersionPositions';

export const useTidyUpWorkflowVersion = () => {
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

  const updateWorkflowVersionPosition = async (
    workflowVersionId: string,
    positions: { id: string; position: { x: number; y: number } }[],
  ) => {
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

    const updatedSteps = cachedRecord.steps?.map((step) => {
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

  const tidyUpWorkflowVersion = async (
    workflowVersionId: string,
    workflowDiagram: WorkflowDiagram,
  ) => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    const positions = tidiedUpDiagram.nodes.map((node) => ({
      id: node.id,
      position: node.position,
    }));

    await updateWorkflowVersionPosition(workflowVersionId, positions);

    return tidiedUpDiagram;
  };

  return { tidyUpWorkflowVersion, updateWorkflowVersionPosition };
};
