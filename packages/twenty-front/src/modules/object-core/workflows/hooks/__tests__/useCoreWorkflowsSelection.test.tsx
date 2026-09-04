import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useCoreWorkflowsSelection } from '@/object-core/workflows/hooks/useCoreWorkflowsSelection';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

const mockDeleteCoreWorkflows = jest.fn();

jest.mock('@/object-core/workflows/hooks/useDeleteCoreWorkflows', () => ({
  useDeleteCoreWorkflows: () => ({
    deleteCoreWorkflows: mockDeleteCoreWorkflows,
    canDeleteCoreWorkflows: true,
    isDeletingCoreWorkflows: false,
  }),
}));

const coreWorkflows = [
  { id: 'core-1', workspaceWorkflowId: 'workspace-1' },
  { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
  { id: 'core-3', workspaceWorkflowId: null },
] as CoreWorkflow[];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderSelection = () =>
  renderHook(
    (props: { coreWorkflows: CoreWorkflow[] }) =>
      useCoreWorkflowsSelection(props),
    { wrapper: Wrapper, initialProps: { coreWorkflows } },
  );

describe('useCoreWorkflowsSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteCoreWorkflows.mockResolvedValue(true);
  });

  it('should map selected rows to the workspace workflows to delete', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    expect(result.current.selectedWorkspaceWorkflowIds).toEqual([
      'workspace-1',
    ]);
  });

  it('should not offer a workflow without a workspace record for deletion', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-3');
    });

    expect(result.current.selectedRowIds).toEqual(['core-3']);
    expect(result.current.selectedWorkspaceWorkflowIds).toEqual([]);
  });

  it('should remove the deleted workflows from the list and clear the selection', async () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    await act(async () => {
      await result.current.deleteSelectedCoreWorkflows();
    });

    expect(mockDeleteCoreWorkflows).toHaveBeenCalledTimes(1);
    expect(mockDeleteCoreWorkflows).toHaveBeenCalledWith(['workspace-1']);
    expect(
      result.current.displayedCoreWorkflows.map(
        (coreWorkflow) => coreWorkflow.id,
      ),
    ).toEqual(['core-2', 'core-3']);
    expect(result.current.selectedRowIds).toEqual([]);
  });

  it('should keep the rows and the selection when the deletion fails', async () => {
    mockDeleteCoreWorkflows.mockResolvedValue(false);

    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    await act(async () => {
      await result.current.deleteSelectedCoreWorkflows();
    });

    expect(result.current.displayedCoreWorkflows).toHaveLength(3);
    expect(result.current.selectedRowIds).toEqual(['core-1']);
  });

  it('should keep a deleted workflow hidden once the mirror drops its workspace record', async () => {
    const { result, rerender } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    await act(async () => {
      await result.current.deleteSelectedCoreWorkflows();
    });

    rerender({
      coreWorkflows: [
        { id: 'core-1', workspaceWorkflowId: null },
        { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
      ] as CoreWorkflow[],
    });

    expect(
      result.current.displayedCoreWorkflows.map(
        (coreWorkflow) => coreWorkflow.id,
      ),
    ).toEqual(['core-2']);
  });

  it('should drop the selection when the filter settings change', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    expect(result.current.selectedRowIds).toEqual(['core-1']);

    act(() => {
      jotaiStore.set(coreWorkflowsFilterSettingsState.atom, {
        stepFilters: [],
      });
    });

    expect(result.current.selectedRowIds).toEqual([]);
    expect(result.current.selectedWorkspaceWorkflowIds).toEqual([]);
  });

  it('should deselect a row that is toggled twice', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });
    act(() => {
      result.current.toggleRow('core-1');
    });

    expect(result.current.selectedRowIds).toEqual([]);
    expect(result.current.selectedWorkspaceWorkflowIds).toEqual([]);
  });
});
