import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useCoreWorkflowsSelection } from '@/object-core/workflows/hooks/useCoreWorkflowsSelection';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

type CoreWorkflowRow = Pick<CoreWorkflow, 'id' | 'workspaceWorkflowId'>;

const coreWorkflows: CoreWorkflowRow[] = [
  { id: 'core-1', workspaceWorkflowId: 'workspace-1' },
  { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
  { id: 'core-3', workspaceWorkflowId: null },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderSelection = () =>
  renderHook(
    (props: { coreWorkflows: CoreWorkflowRow[] }) =>
      useCoreWorkflowsSelection(props),
    { wrapper: Wrapper, initialProps: { coreWorkflows } },
  );

describe('useCoreWorkflowsSelection', () => {
  it('should map selected rows to the workspace workflows the command menu targets', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    expect(result.current.selectedWorkspaceWorkflowIds).toEqual([
      'workspace-1',
    ]);
  });

  it('should not target a workflow that has no workspace record', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-3');
    });

    expect(result.current.selectedRowIds).toEqual(['core-3']);
    expect(result.current.selectedWorkspaceWorkflowIds).toEqual([]);
  });

  it('should drop the deleted rows and clear the selection when a deletion is reported', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    act(() => {
      result.current.forgetDeletedWorkspaceWorkflows(['workspace-1']);
    });

    expect(
      result.current.displayedCoreWorkflows.map(
        (coreWorkflow) => coreWorkflow.id,
      ),
    ).toEqual(['core-2', 'core-3']);
    expect(result.current.selectedRowIds).toEqual([]);
  });

  it('should ignore a deletion that targets rows it is not showing', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    act(() => {
      result.current.forgetDeletedWorkspaceWorkflows(['workspace-elsewhere']);
    });

    expect(result.current.displayedCoreWorkflows).toHaveLength(3);
    expect(result.current.selectedRowIds).toEqual(['core-1']);
  });

  it('should keep a deleted workflow hidden once the mirror drops its workspace record', () => {
    const { result, rerender } = renderSelection();

    act(() => {
      result.current.forgetDeletedWorkspaceWorkflows(['workspace-1']);
    });

    rerender({
      coreWorkflows: [
        { id: 'core-1', workspaceWorkflowId: null },
        { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
      ],
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
  });
});
