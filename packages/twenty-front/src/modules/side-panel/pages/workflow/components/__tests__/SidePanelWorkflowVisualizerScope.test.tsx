import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { sidePanelWorkflowVisualizerComponentInstanceIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVisualizerComponentInstanceIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

const SIDE_PANEL_PAGE_ID = 'side-panel-page-id';
const WORKFLOW_VISUALIZER_COMPONENT_INSTANCE_ID =
  'workflow-id-source-surface-id';

const FlowVersionId = () => {
  const flow = useFlowOrThrow();
  const workflowVisualizerComponentInstanceId = useAvailableComponentInstanceId(
    WorkflowVisualizerComponentInstanceContext,
  );

  return (
    <>
      <div>{flow.workflowVersionId}</div>
      <div>{workflowVisualizerComponentInstanceId}</div>
    </>
  );
};

describe('SidePanelWorkflowVisualizerScope', () => {
  it('reads workflow state from the visualizer that opened the side panel', () => {
    const store = createStore();

    store.set(
      sidePanelWorkflowVisualizerComponentInstanceIdComponentState.atomFamily({
        instanceId: SIDE_PANEL_PAGE_ID,
      }),
      WORKFLOW_VISUALIZER_COMPONENT_INSTANCE_ID,
    );
    store.set(
      flowComponentState.atomFamily({
        instanceId: WORKFLOW_VISUALIZER_COMPONENT_INSTANCE_ID,
      }),
      {
        workflowVersionId: 'workflow-version-id',
        trigger: null,
        steps: null,
      },
    );

    render(
      <Provider store={store}>
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: SIDE_PANEL_PAGE_ID }}
        >
          <WorkspaceSurfaceContext.Provider
            value={{
              type: 'side-panel',
              instanceId: SIDE_PANEL_PAGE_ID,
              ownsRouteLocation: false,
            }}
          >
            <SidePanelWorkflowVisualizerScope>
              <FlowVersionId />
            </SidePanelWorkflowVisualizerScope>
          </WorkspaceSurfaceContext.Provider>
        </SidePanelPageComponentInstanceContext.Provider>
      </Provider>,
    );

    expect(screen.getByText('workflow-version-id')).toBeVisible();
    expect(
      screen.getByText(WORKFLOW_VISUALIZER_COMPONENT_INSTANCE_ID),
    ).toBeVisible();
  });
});
