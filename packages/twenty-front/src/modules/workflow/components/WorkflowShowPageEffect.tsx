import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowShowPageEffectProps = {
  workflowId: string;
};

export const WorkflowShowPageEffect = ({
  workflowId,
}: WorkflowShowPageEffectProps) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const setShowPageWorkflowId = useSetRecoilState(showPageWorkflowIdState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    setShowPageWorkflowId(workflowId);
  }, [setShowPageWorkflowId, workflowId]);

  useEffect(() => {
    const currentVersion = workflowWithCurrentVersion?.currentVersion;
    if (!isDefined(currentVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const flowLastVersion = getWorkflowVersionDiagram(currentVersion);
    const flowWithCreateStepNodes = addCreateStepNodes(flowLastVersion);

    setWorkflowDiagram(flowWithCreateStepNodes);
  }, [setWorkflowDiagram, workflowWithCurrentVersion?.currentVersion]);

  return null;
};
