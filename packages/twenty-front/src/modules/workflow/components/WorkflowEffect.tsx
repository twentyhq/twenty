import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';

import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { mergeWorkflowDiagrams } from '@/workflow/utils/mergeWorkflowDiagrams';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
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

  const computeAndMergeNewWorkflowDiagram = useRecoilCallback(
    ({ snapshot, set }) => {
      return (currentVersion: WorkflowVersion) => {
        const previousWorkflowDiagram = getSnapshotValue(
          snapshot,
          workflowDiagramState,
        );

        const nextWorkflowDiagram = getWorkflowVersionDiagram(currentVersion);

        let mergedWorkflowDiagram = nextWorkflowDiagram;
        if (isDefined(previousWorkflowDiagram)) {
          mergedWorkflowDiagram = mergeWorkflowDiagrams(
            previousWorkflowDiagram,
            nextWorkflowDiagram,
          );
        }

        const workflowDiagramWithCreateStepNodes = addCreateStepNodes(
          mergedWorkflowDiagram,
        );

        set(workflowDiagramState, workflowDiagramWithCreateStepNodes);
      };
    },
    [],
  );

  useEffect(() => {
    const currentVersion = workflowWithCurrentVersion?.currentVersion;
    if (!isDefined(currentVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    computeAndMergeNewWorkflowDiagram(currentVersion);
  }, [
    computeAndMergeNewWorkflowDiagram,
    setWorkflowDiagram,
    workflowWithCurrentVersion?.currentVersion,
  ]);

  return null;
};
