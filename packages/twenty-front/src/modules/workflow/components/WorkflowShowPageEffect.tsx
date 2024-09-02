import { useFindWorkflowWithCurrentVersion } from '@/workflow/hooks/useFindWorkflowWithCurrentVersion';
import { showPageWorkflowDiagramState } from '@/workflow/states/showPageWorkflowDiagramState';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
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
  const workflowWithCurrentVersion =
    useFindWorkflowWithCurrentVersion(workflowId);

  const setShowPageWorkflowId = useSetRecoilState(showPageWorkflowIdState);
  const setCurrentWorkflowData = useSetRecoilState(
    showPageWorkflowDiagramState,
  );

  useEffect(() => {
    setShowPageWorkflowId(workflowId);
  }, [setShowPageWorkflowId, workflowId]);

  useEffect(() => {
    const currentVersion = workflowWithCurrentVersion?.currentVersion;
    if (!isDefined(currentVersion)) {
      setCurrentWorkflowData(undefined);

      return;
    }

    const flowLastVersion = getWorkflowVersionDiagram(currentVersion);
    const flowWithCreateStepNodes = addCreateStepNodes(flowLastVersion);

    setCurrentWorkflowData(flowWithCreateStepNodes);
  }, [setCurrentWorkflowData, workflowWithCurrentVersion?.currentVersion]);

  return null;
};
