import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowDiagramTriggerNodeSelectionComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramTriggerNodeSelectionComponentState';
import { act, renderHook } from '@testing-library/react';
import { useReactFlow } from '@xyflow/react';
import { RecoilRoot } from 'recoil';

jest.mock('@xyflow/react', () => ({
  useReactFlow: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: 'test-instance-id',
      }}
    >
      {children}
    </WorkflowVisualizerComponentInstanceContext.Provider>
  </RecoilRoot>
);

describe('useTriggerNodeSelection', () => {
  const mockSetNodes = jest.fn();

  beforeEach(() => {
    (useReactFlow as jest.Mock).mockReturnValue({
      setNodes: mockSetNodes,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger node selection', () => {
    const { result } = renderHook(
      () => {
        const [
          workflowDiagramTriggerNodeSelection,
          setWorkflowDiagramTriggerNodeSelection,
        ] = useRecoilComponentStateV2(
          workflowDiagramTriggerNodeSelectionComponentState,
        );

        useTriggerNodeSelection();

        return {
          workflowDiagramTriggerNodeSelection,
          setWorkflowDiagramTriggerNodeSelection,
        };
      },
      {
        wrapper,
      },
    );

    const mockNodeId = 'test-node-id';

    act(() => {
      result.current.setWorkflowDiagramTriggerNodeSelection(mockNodeId);
    });

    expect(result.current.workflowDiagramTriggerNodeSelection).toBeUndefined();
  });

  it('should not trigger update if state is not defined', () => {
    renderHook(() => useTriggerNodeSelection(), {
      wrapper,
    });

    // Ensure updateNode is not called when state is undefined
    expect(mockSetNodes).not.toHaveBeenCalled();
  });
});
