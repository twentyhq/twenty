import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

// A draft copies the records some steps point to (logic function, agent), so edits must target the draft's step
export const useGetUpdatableWorkflowVersionStepOrThrow = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const getUpdatableWorkflowVersionStep = async <
    TStepType extends WorkflowAction['type'],
  >({
    stepId,
    stepType,
  }: {
    stepId: string;
    stepType: TStepType;
  }): Promise<Extract<WorkflowAction, { type: TStepType }>> => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const { data } = await apolloCoreClient.query({
      query: GetCoreWorkflowVersionDocument,
      variables: { coreWorkflowVersionId: workflowVersionId },
    });

    const step = buildWorkflowVersionFromCore(
      data?.coreWorkflowVersion,
    )?.steps?.find((candidateStep) => candidateStep.id === stepId);

    if (!isDefined(step) || step.type !== stepType) {
      throw new Error(
        doNotTranslate(
          'Failed to find the step in the updatable workflow version',
        ),
      );
    }

    return step as Extract<WorkflowAction, { type: TStepType }>;
  };

  return { getUpdatableWorkflowVersionStep };
};
