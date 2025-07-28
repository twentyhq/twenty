import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client';
import {
  UpdateDraftWorkflowVersionPositionsMutation,
  UpdateDraftWorkflowVersionPositionsMutationVariables,
  WorkflowAction,
} from '~/generated-metadata/graphql';
import { UPDATE_DRAFT_WORKFLOW_VERSION_POSITIONS } from '@/workflow/workflow-version/graphql/mutations/updateDraftWorkflowVersionPositions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';

export const useTidyUpWorkflowVersion = ({
  workflow,
}: {
  workflow?: WorkflowWithCurrentVersion;
}) => {
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
    UpdateDraftWorkflowVersionPositionsMutation,
    UpdateDraftWorkflowVersionPositionsMutationVariables
  >(UPDATE_DRAFT_WORKFLOW_VERSION_POSITIONS, { client: apolloCoreClient });

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const tidyUpWorkflowVersion = async (
    positions: { id: string; position: { x: number; y: number } }[],
  ) => {
    if (!isDefined(workflow?.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

    await mutate({ variables: { input: { workflowVersionId, positions } } });

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const triggerPosition = positions.find(
      (position) => position.id === 'trigger',
    );

    const updatedTrigger = isDefined(triggerPosition)
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

  return { tidyUpWorkflowVersion };
};
