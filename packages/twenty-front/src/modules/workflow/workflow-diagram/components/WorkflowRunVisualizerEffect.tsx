import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
import { workflowRunStepToOpenByDefaultComponentState } from '@/workflow/workflow-diagram/states/workflowRunStepToOpenByDefaultComponentState';
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

  const setWorkflowRunId = useSetRecoilComponentStateV2(
    workflowVisualizerWorkflowRunIdComponentState,
  );
  const workflowVisualizerWorkflowIdState = useRecoilComponentCallbackStateV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentStateV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const flowState = useRecoilComponentCallbackStateV2(flowComponentState);
  const workflowDiagramState = useRecoilComponentCallbackStateV2(
    workflowDiagramComponentState,
  );
  const workflowDiagramStatusState = useRecoilComponentCallbackStateV2(
    workflowDiagramStatusComponentState,
  );
  const workflowRunStepToOpenByDefaultState = useRecoilComponentCallbackStateV2(
    workflowRunStepToOpenByDefaultComponentState,
  );
  const workflowSelectedNodeState = useRecoilComponentCallbackStateV2(
    workflowSelectedNodeComponentState,
  );
  const workflowRunDiagramAutomaticallyOpenedStepsState =
    useRecoilComponentCallbackStateV2(
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

        if (isDefined(stepToOpenByDefault)) {
          if (isInRightDrawer) {
            set(workflowDiagramState, baseWorkflowRunDiagram);

            const workflowRunDiagramAutomaticallyOpenedSteps = getSnapshotValue(
              snapshot,
              workflowRunDiagramAutomaticallyOpenedStepsState,
            );
            const hasStepAlreadyBeenOpenedAutomatically =
              workflowRunDiagramAutomaticallyOpenedSteps.includes(
                stepToOpenByDefault.id,
              );

            if (
              workflowDiagramStatus === 'done' &&
              !hasStepAlreadyBeenOpenedAutomatically
            ) {
              set(workflowSelectedNodeState, stepToOpenByDefault.id);

              const workflowVisualizerWorkflowId = getSnapshotValue(
                snapshot,
                workflowVisualizerWorkflowIdState,
              );
              if (!isDefined(workflowVisualizerWorkflowId)) {
                throw new Error(
                  'The workflow id must be set; ensure the workflow id is always set before rendering the workflow diagram.',
                );
              }

              set(workflowRunDiagramAutomaticallyOpenedStepsState, [
                ...workflowRunDiagramAutomaticallyOpenedSteps,
                stepToOpenByDefault.id,
              ]);
              openWorkflowRunViewStepInCommandMenu({
                workflowId: workflowVisualizerWorkflowId,
                workflowRunId,
                title: stepToOpenByDefault.data.name,
                icon: getIcon(getWorkflowNodeIconKey(stepToOpenByDefault.data)),
                workflowSelectedNode: stepToOpenByDefault.id,
                stepExecutionStatus: stepToOpenByDefault.data.runStatus,
              });
            }
          } else {
            const workflowRunDiagram = selectWorkflowDiagramNode({
              diagram: baseWorkflowRunDiagram,
              nodeIdToSelect: stepToOpenByDefault.id,
            });

            set(workflowDiagramState, workflowRunDiagram);
            set(workflowRunStepToOpenByDefaultState, {
              id: stepToOpenByDefault.id,
              data: stepToOpenByDefault.data,
            });
          }
        } else {
          set(workflowDiagramState, baseWorkflowRunDiagram);
        }

        if (workflowDiagramStatus !== 'done') {
          set(workflowDiagramStatusState, 'computing-dimensions');
        }
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
      workflowRunStepToOpenByDefaultState,
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
