import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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
  const setWorkflowRunId = useSetAtomComponentState(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  const workflowVersionId = workflowRun?.workflowVersionId;
  const workflowVersion = useWorkflowVersion(workflowVersionId);
  const setWorkflowVisualizerWorkflowVersionId = useSetAtomComponentState(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const workflowVisualizerWorkflowId = useAtomComponentStateCallbackState(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetAtomComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );

  const flow = useAtomComponentStateCallbackState(flowComponentState);
  const workflowDiagram = useAtomComponentStateCallbackState(
    workflowDiagramComponentState,
  );
  const workflowSelectedNode = useAtomComponentStateCallbackState(
    workflowSelectedNodeComponentState,
  );

  const workflowDiagramStatusState = useAtomComponentStateCallbackState(
    workflowDiagramStatusComponentState,
  );
  const workflowRunDiagramAutomaticallyOpenedStepsState =
    useAtomComponentStateCallbackState(
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
        store.set(flow, undefined);
        store.set(workflowDiagram, undefined);

        return;
      }

      const workflowDiagramStatus = store.get(workflowDiagramStatusState);

      if (workflowDiagramStatus !== 'done') {
        store.set(workflowDiagramStatusState, 'computing-diagram');
      }

      store.set(flow, {
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
        store.set(workflowDiagram, baseWorkflowRunDiagram);

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

      const currentWorkflowVisualizerWorkflowId = store.get(
        workflowVisualizerWorkflowId,
      );
      if (!isDefined(currentWorkflowVisualizerWorkflowId)) {
        throw new Error(
          'The workflow id must be set; ensure the workflow id is always set before rendering the workflow diagram.',
        );
      }

      if (inRightDrawer) {
        store.set(workflowDiagram, baseWorkflowRunDiagram);
      } else {
        const workflowRunDiagram = selectWorkflowDiagramNode({
          diagram: baseWorkflowRunDiagram,
          nodeIdToSelect: stepToOpenByDefault.id,
        });

        store.set(workflowDiagram, workflowRunDiagram);
      }

      if (hasStepAlreadyBeenOpenedAutomatically) {
        return;
      }

      store.set(workflowSelectedNode, stepToOpenByDefault.id);

      store.set(workflowRunDiagramAutomaticallyOpenedStepsState, [
        ...workflowRunDiagramAutomaticallyOpenedSteps,
        {
          stepId: stepToOpenByDefault.id,
          isInRightDrawer: inRightDrawer,
        },
      ]);

      openWorkflowRunViewStepInCommandMenu({
        workflowId: currentWorkflowVisualizerWorkflowId,
        workflowRunId,
        title: stepToOpenByDefault.data.name,
        icon: getIcon(getWorkflowNodeIconKey(stepToOpenByDefault.data)),
        workflowSelectedNode: stepToOpenByDefault.id,
        stepExecutionStatus: stepToOpenByDefault.data.runStatus,
      });
    },
    [
      flow,
      getIcon,
      openWorkflowRunViewStepInCommandMenu,
      workflowDiagram,
      workflowDiagramStatusState,
      workflowRunDiagramAutomaticallyOpenedStepsState,
      workflowRunId,
      workflowSelectedNode,
      workflowVisualizerWorkflowId,
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
