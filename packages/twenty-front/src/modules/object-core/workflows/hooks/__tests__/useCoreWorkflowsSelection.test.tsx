import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useCoreWorkflowsSelection } from '@/object-core/workflows/hooks/useCoreWorkflowsSelection';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import {
  EMPTY_CORE_WORKFLOWS_SELECTION,
  coreWorkflowsSelectionState,
} from '@/object-core/workflows/states/coreWorkflowsSelectionState';
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
  beforeEach(() => {
    jotaiStore.set(
      coreWorkflowsSelectionState.atom,
      EMPTY_CORE_WORKFLOWS_SELECTION,
    );
    jotaiStore.set(coreWorkflowsFilterSettingsState.atom, {});
  });

  it('should expose the selected rows through the shared selection state', () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    expect(result.current.selectedRowIds).toEqual(['core-1']);
    expect(jotaiStore.get(coreWorkflowsSelectionState.atom).rowIds).toEqual([
      'core-1',
    ]);
  });

  it('should reset the selection when the page unmounts', () => {
    const { result, unmount } = renderSelection();

    act(() => {
      result.current.toggleRow('core-1');
    });

    unmount();

    expect(jotaiStore.get(coreWorkflowsSelectionState.atom)).toEqual(
      EMPTY_CORE_WORKFLOWS_SELECTION,
    );
  });

  it('selects a core workflow without a workspace mirror ID', () => {
    const { result } = renderSelection();
    act(() => result.current.toggleRow('core-3'));
    expect(result.current.selectedRowIds).toEqual(['core-3']);
  });

  it('removes deleted records from displayed and command selections after refetch', () => {
    const { result, rerender } = renderSelection();
    act(() => result.current.toggleRow('core-1'));
    rerender({ coreWorkflows: coreWorkflows.slice(1) });
    expect(result.current.selectedRowIds).toEqual([]);
    expect(jotaiStore.get(coreWorkflowsSelectionState.atom).rowIds).toEqual([]);
    expect(result.current.displayedCoreWorkflows.map(({ id }) => id)).toEqual([
      'core-2',
      'core-3',
    ]);
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
