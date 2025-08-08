import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { WorkflowRunState } from '@/workflow/types/Workflow';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramStatusComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusComponentState';
import { workflowRunDiagramAutomaticallyOpenedStepsComponentState } from '@/workflow/workflow-diagram/states/workflowRunDiagramAutomaticallyOpenedStepsComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { selectWorkflowDiagramNode } from '@/workflow/workflow-diagram/utils/selectWorkflowDiagramNode';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext, useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';

export const WorkflowRunVisualizerEffect = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const { getIcon } = useIcons();

  const workflowRun = useWorkflowRun({ workflowRunId });
  const workflowVersion = useWorkflowVersion(workflowRun?.workflowVersionId);

  const setWorkflowRunId = useSetRecoilComponentState(
    workflowVisualizerWorkflowRunIdComponentState,
  );
  const workflowVisualizerWorkflowIdState = useRecoilComponentCallbackState(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );

  const flowState = useRecoilComponentCallbackState(flowComponentState);
  const workflowDiagramState = useRecoilComponentCallbackState(
    workflowDiagramComponentState,
  );
  const workflowDiagramStatusState = useRecoilComponentCallbackState(
    workflowDiagramStatusComponentState,
  );
  const workflowSelectedNodeState = useRecoilComponentCallbackState(
    workflowSelectedNodeComponentState,
  );
  const workflowRunDiagramAutomaticallyOpenedStepsState =
    useRecoilComponentCallbackState(
      workflowRunDiagramAutomaticallyOpenedStepsComponentState,
    );

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const isWorkflowFilteringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_FILTERING_ENABLED,
  );

  useEffect(() => {
    setWorkflowRunId(workflowRunId);
  }, [setWorkflowRunId, workflowRunId]);

  useEffect(() => {
    if (!isDefined(workflowRun)) {
      return;
    }

    setWorkflowVisualizerWorkflowId(workflowRun.workflowId);
  }, [setWorkflowVisualizerWorkflowId, workflowRun]);

  const handleWorkflowRunDiagramGeneration = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        workflowRunState,
        workflowVersionId,
        isInRightDrawer,
      }: {
        workflowRunState: WorkflowRunState | undefined;
        workflowVersionId: string | undefined;
        isInRightDrawer: boolean;
      }) => {
        if (!(isDefined(workflowRunState) && isDefined(workflowVersionId))) {
          set(flowState, undefined);
          set(workflowDiagramState, undefined);

          return;
        }

        const workflowDiagramStatus = getSnapshotValue(
          snapshot,
          workflowDiagramStatusState,
        );

        if (workflowDiagramStatus !== 'done') {
          set(workflowDiagramStatusState, 'computing-diagram');
        }

        set(flowState, {
          workflowVersionId,
          trigger: workflowRunState.flow.trigger,
          steps: workflowRunState.flow.steps,
        });

        const { diagram: baseWorkflowRunDiagram, stepToOpenByDefault } =
          generateWorkflowRunDiagram({
            trigger: workflowRunState.flow.trigger,
            steps: workflowRunState.flow.steps,
            stepInfos: workflowRunState.stepInfos,
            isWorkflowFilteringEnabled,
          });

        if (workflowDiagramStatus !== 'done') {
          set(workflowDiagramStatusState, 'computing-dimensions');
        }

        if (!isDefined(stepToOpenByDefault)) {
          set(workflowDiagramState, baseWorkflowRunDiagram);

          return;
        }

        const workflowRunDiagramAutomaticallyOpenedSteps = getSnapshotValue(
          snapshot,
          workflowRunDiagramAutomaticallyOpenedStepsState,
        );
        const hasStepAlreadyBeenOpenedAutomatically =
          workflowRunDiagramAutomaticallyOpenedSteps.some(
            (step) =>
              step.stepId === stepToOpenByDefault.id &&
              step.isInRightDrawer === isInRightDrawer,
          );

        const workflowVisualizerWorkflowId = getSnapshotValue(
          snapshot,
          workflowVisualizerWorkflowIdState,
        );
        if (!isDefined(workflowVisualizerWorkflowId)) {
          throw new Error(
            'The workflow id must be set; ensure the workflow id is always set before rendering the workflow diagram.',
          );
        }

        if (isInRightDrawer) {
          set(workflowDiagramState, baseWorkflowRunDiagram);
        } else {
          const workflowRunDiagram = selectWorkflowDiagramNode({
            diagram: baseWorkflowRunDiagram,
            nodeIdToSelect: stepToOpenByDefault.id,
          });

          set(workflowDiagramState, workflowRunDiagram);
        }

        if (hasStepAlreadyBeenOpenedAutomatically) {
          return;
        }

        set(workflowSelectedNodeState, stepToOpenByDefault.id);

        set(workflowRunDiagramAutomaticallyOpenedStepsState, [
          ...workflowRunDiagramAutomaticallyOpenedSteps,
          {
            stepId: stepToOpenByDefault.id,
            isInRightDrawer,
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
      flowState,
      getIcon,
      isWorkflowFilteringEnabled,
      openWorkflowRunViewStepInCommandMenu,
      workflowDiagramState,
      workflowDiagramStatusState,
      workflowRunDiagramAutomaticallyOpenedStepsState,
      workflowRunId,
      workflowSelectedNodeState,
      workflowVisualizerWorkflowIdState,
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
