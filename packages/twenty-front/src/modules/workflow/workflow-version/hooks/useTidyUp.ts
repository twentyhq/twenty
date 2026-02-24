import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const useTidyUp = () => {
  const [workflowDiagram, setWorkflowDiagram] = useRecoilComponentStateV2(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const tidyUp = async () => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const tidiedUpDiagram = await tidyUpWorkflowVersion(
      workflowVersionId,
      workflowDiagram,
    );

    if (isDefined(tidiedUpDiagram)) {
      setWorkflowDiagram(tidiedUpDiagram);
    }
  };

  return { tidyUp };
};
