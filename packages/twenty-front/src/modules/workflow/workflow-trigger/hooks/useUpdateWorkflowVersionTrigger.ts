import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { UPDATE_WORKFLOW_VERSION_TRIGGER } from '@/workflow/graphql/mutations/updateWorkflowVersionTrigger';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import {
  type WorkflowTrigger,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useMutation } from '@apollo/client/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import {
  type UpdateWorkflowVersionTriggerMutation,
  type UpdateWorkflowVersionTriggerMutationVariables,
} from '~/generated/graphql';

export const useUpdateWorkflowVersionTrigger = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { enqueueErrorSnackBar } = useSnackBar();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const { markStepForRecomputation } = useStepsOutputSchema();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const [mutate] = useMutation<
    UpdateWorkflowVersionTriggerMutation,
    UpdateWorkflowVersionTriggerMutationVariables
  >(UPDATE_WORKFLOW_VERSION_TRIGGER, {
    client: apolloCoreClient,
  });

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const { data } = await mutate({
      variables: {
        input: {
          workflowVersionId,
          trigger: updatedTrigger,
        },
      },
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });

    if (!isDefined(data?.updateWorkflowVersionTrigger)) {
      return;
    }

    markStepForRecomputation({
      stepId: TRIGGER_STEP_ID,
      workflowVersionId,
    });

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);
    if (!isDefined(cachedRecord)) {
      return;
    }

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: {
        ...cachedRecord,
        trigger: updatedTrigger,
      },
      recordGqlFields: {
        trigger: true,
      },
      objectPermissionsByObjectMetadataId,
    });
  };

  return {
    updateTrigger,
  };
};
