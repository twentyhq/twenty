import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client';
import {
  UpdateDraftWorkflowVersionPositionsMutation,
  UpdateDraftWorkflowVersionPositionsMutationVariables,
} from '~/generated-metadata/graphql';
import { UPDATE_DRAFT_WORKFLOW_VERSION_POSITIONS } from '@/workflow/workflow-version/graphql/mutations/updateDraftWorkflowVersionPositions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export const useTidyUpWorkflowVersion = ({
  workflow,
}: {
  workflow?: WorkflowWithCurrentVersion;
}) => {
  const apolloCoreClient = useApolloCoreClient();

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
  };

  return { tidyUpWorkflowVersion };
};
