import { useApolloClient, useMutation } from '@apollo/client';
import {
  CreateWorkflowVersionStepMutation,
  CreateWorkflowVersionStepMutationVariables,
  CreateWorkflowVersionStepInput,
} from '~/generated/graphql';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isDefined } from 'twenty-ui';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { WorkflowVersion } from '@/workflow/types/Workflow';

export const useCreateWorkflowVersionStep = () => {
  const apolloClient = useApolloClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const [mutate] = useMutation<
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >(CREATE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });
  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
    });
    const createdStep = result?.data?.createWorkflowVersionStep;
    if (!isDefined(createdStep)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(
      input.workflowVersionId,
    );
    if (!cachedRecord) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: [...(cachedRecord.steps || []), createdStep],
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloClient.cache,
      record: newCachedRecord,
    });
    return result;
  };

  return { createWorkflowVersionStep };
};
