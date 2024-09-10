import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowEffectProps = {
  workflowId: string;
};

export const WorkflowEffect = ({ workflowId }: WorkflowEffectProps) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const setWorkflowId = useSetRecoilState(workflowIdState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    setWorkflowId(workflowId);
  }, [setWorkflowId, workflowId]);

  useEffect(() => {
    const currentVersion = workflowWithCurrentVersion?.currentVersion;
    if (!isDefined(currentVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const lastWorkflowDiagram = getWorkflowVersionDiagram(currentVersion);
    const workflowDiagramWithCreateStepNodes =
      addCreateStepNodes(lastWorkflowDiagram);

    setWorkflowDiagram(workflowDiagramWithCreateStepNodes);
  }, [setWorkflowDiagram, workflowWithCurrentVersion?.currentVersion]);

  return null;
};
