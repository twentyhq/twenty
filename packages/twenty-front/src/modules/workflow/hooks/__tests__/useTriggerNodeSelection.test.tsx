import { renderHook, act } from '@testing-library/react';
import { useTriggerNodeSelection } from '@/workflow/hooks/useTriggerNodeSelection';
import { RecoilRoot, useRecoilState } from 'recoil';
import { useReactFlow } from '@xyflow/react';
import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/states/workflowDiagramTriggerNodeSelectionState';

jest.mock('@xyflow/react', () => ({
  useReactFlow: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useTriggerNodeSelection', () => {
  const mockUpdateNode = jest.fn();

  beforeEach(() => {
    (useReactFlow as jest.Mock).mockReturnValue({
      updateNode: mockUpdateNode,
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

    expect(mockUpdateNode).toHaveBeenCalledWith(mockNodeId, { selected: true });
    expect(result.current.workflowDiagramTriggerNodeSelection).toBeUndefined();
  });

  it('should not trigger update if state is not defined', () => {
    renderHook(() => useTriggerNodeSelection(), {
      wrapper,
    });

    // Ensure updateNode is not called when state is undefined
    expect(mockUpdateNode).not.toHaveBeenCalled();
  });
});
