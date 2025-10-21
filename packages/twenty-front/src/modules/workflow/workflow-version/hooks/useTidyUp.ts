import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const useTidyUp = () => {
  const [workflowDiagram, setWorkflowDiagram] = useRecoilComponentState(
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
