import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/workflow-diagram/states/workflowDiagramTriggerNodeSelectionState';
import { act, renderHook } from '@testing-library/react';
import { useReactFlow } from '@xyflow/react';
import { RecoilRoot, useRecoilState } from 'recoil';

jest.mock('@xyflow/react', () => ({
  useReactFlow: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
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
        ] = useRecoilState(workflowDiagramTriggerNodeSelectionState);

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
