import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { type WorkflowRunState } from '@/workflow/types/Workflow';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramStatusComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusComponentState';
import { workflowRunDiagramAutomaticallyOpenedStepsComponentState } from '@/workflow/workflow-diagram/states/workflowRunDiagramAutomaticallyOpenedStepsComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { selectWorkflowDiagramNode } from '@/workflow/workflow-diagram/utils/selectWorkflowDiagramNode';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useStore } from 'jotai';
import { useCallback, useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunVisualizerEffect = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const { getIcon } = useIcons();

  const workflowRun = useWorkflowRun({ workflowRunId });
  const setWorkflowRunId = useSetRecoilComponentStateV2(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  const workflowVersionId = workflowRun?.workflowVersionId;
  const workflowVersion = useWorkflowVersion(workflowVersionId);
  const setWorkflowVisualizerWorkflowVersionId = useSetRecoilComponentStateV2(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const workflowVisualizerWorkflowIdAtom =
    useRecoilComponentStateCallbackStateV2(
      workflowVisualizerWorkflowIdComponentState,
    );
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentStateV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const flowAtom = useRecoilComponentStateCallbackStateV2(flowComponentState);
  const workflowDiagramAtom = useRecoilComponentStateCallbackStateV2(
    workflowDiagramComponentState,
  );
  const workflowSelectedNodeAtom = useRecoilComponentStateCallbackStateV2(
    workflowSelectedNodeComponentState,
  );

  const workflowDiagramStatusState = useRecoilComponentStateCallbackStateV2(
    workflowDiagramStatusComponentState,
  );
  const workflowRunDiagramAutomaticallyOpenedStepsState =
    useRecoilComponentStateCallbackStateV2(
      workflowRunDiagramAutomaticallyOpenedStepsComponentState,
    );

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const store = useStore();

  useEffect(() => {
    setWorkflowRunId(workflowRunId);
  }, [setWorkflowRunId, workflowRunId]);

  useEffect(() => {
    if (!isDefined(workflowRun)) {
      return;
    }

    setWorkflowVisualizerWorkflowId(workflowRun.workflowId);
  }, [setWorkflowVisualizerWorkflowId, workflowRun]);

  useEffect(() => {
    if (!isDefined(workflowVersionId)) {
      return;
    }

    setWorkflowVisualizerWorkflowVersionId(workflowVersionId);
  }, [setWorkflowVisualizerWorkflowVersionId, workflowVersionId]);

  const handleWorkflowRunDiagramGeneration = useCallback(
    ({
      workflowRunState,
      workflowVersionId: versionId,
      isInRightDrawer: inRightDrawer,
    }: {
      workflowRunState: WorkflowRunState | undefined;
      workflowVersionId: string | undefined;
      isInRightDrawer: boolean;
    }) => {
      if (!(isDefined(workflowRunState) && isDefined(versionId))) {
        store.set(flowAtom, undefined);
        store.set(workflowDiagramAtom, undefined);

        return;
      }

      const workflowDiagramStatus = store.get(workflowDiagramStatusState);

      if (workflowDiagramStatus !== 'done') {
        store.set(workflowDiagramStatusState, 'computing-diagram');
      }

      store.set(flowAtom, {
        workflowVersionId: versionId,
        trigger: workflowRunState.flow.trigger,
        steps: workflowRunState.flow.steps,
      });

      const { diagram: baseWorkflowRunDiagram, stepToOpenByDefault } =
        generateWorkflowRunDiagram({
          trigger: workflowRunState.flow.trigger,
          steps: workflowRunState.flow.steps,
          stepInfos: workflowRunState.stepInfos,
        });

      if (workflowDiagramStatus !== 'done') {
        store.set(workflowDiagramStatusState, 'computing-dimensions');
      }

      if (!isDefined(stepToOpenByDefault)) {
        store.set(workflowDiagramAtom, baseWorkflowRunDiagram);

        return;
      }

      const workflowRunDiagramAutomaticallyOpenedSteps = store.get(
        workflowRunDiagramAutomaticallyOpenedStepsState,
      );
      const hasStepAlreadyBeenOpenedAutomatically =
        workflowRunDiagramAutomaticallyOpenedSteps.some(
          (step) =>
            step.stepId === stepToOpenByDefault.id &&
            step.isInRightDrawer === inRightDrawer,
        );

      const workflowVisualizerWorkflowId = store.get(
        workflowVisualizerWorkflowIdAtom,
      );
      if (!isDefined(workflowVisualizerWorkflowId)) {
        throw new Error(
          'The workflow id must be set; ensure the workflow id is always set before rendering the workflow diagram.',
        );
      }

      if (inRightDrawer) {
        store.set(workflowDiagramAtom, baseWorkflowRunDiagram);
      } else {
        const workflowRunDiagram = selectWorkflowDiagramNode({
          diagram: baseWorkflowRunDiagram,
          nodeIdToSelect: stepToOpenByDefault.id,
        });

        store.set(workflowDiagramAtom, workflowRunDiagram);
      }

      if (hasStepAlreadyBeenOpenedAutomatically) {
        return;
      }

      store.set(workflowSelectedNodeAtom, stepToOpenByDefault.id);

      store.set(workflowRunDiagramAutomaticallyOpenedStepsState, [
        ...workflowRunDiagramAutomaticallyOpenedSteps,
        {
          stepId: stepToOpenByDefault.id,
          isInRightDrawer: inRightDrawer,
        },
      ]);

      openWorkflowRunViewStepInCommandMenu({
        workflowId: workflowVisualizerWorkflowId,
        workflowRunId,
        title: stepToOpenByDefault.data.name,
        icon: getIcon(getWorkflowNodeIconKey(stepToOpenByDefault.data)),
        workflowSelectedNode: stepToOpenByDefault.id,
        stepExecutionStatus: stepToOpenByDefault.data.runStatus,
      });
    },
    [
      flowAtom,
      getIcon,
      openWorkflowRunViewStepInCommandMenu,
      workflowDiagramAtom,
      workflowDiagramStatusState,
      workflowRunDiagramAutomaticallyOpenedStepsState,
      workflowRunId,
      workflowSelectedNodeAtom,
      workflowVisualizerWorkflowIdAtom,
      store,
    ],
  );

  useEffect(() => {
    handleWorkflowRunDiagramGeneration({
      workflowRunState: workflowRun?.state ?? undefined,
      workflowVersionId: workflowRun?.workflowVersionId,
      isInRightDrawer,
    });
  }, [
    handleWorkflowRunDiagramGeneration,
    isInRightDrawer,
    workflowRun?.state,
    workflowRun?.workflowVersionId,
  ]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      return;
    }

    populateStepsOutputSchema(workflowVersion);
  }, [populateStepsOutputSchema, workflowVersion]);

  return null;
};
