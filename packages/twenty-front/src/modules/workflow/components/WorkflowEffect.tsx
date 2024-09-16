import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowEffectProps = {
  workflowId: string;
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
};

export const WorkflowEffect = ({
  workflowId,
  workflowWithCurrentVersion,
}: WorkflowEffectProps) => {
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
