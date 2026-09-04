import { getSelectedWorkspaceWorkflowIds } from '@/object-core/workflows/utils/getSelectedWorkspaceWorkflowIds';

describe('getSelectedWorkspaceWorkflowIds', () => {
  it('should map the selected rows to their workspace workflow ids', () => {
    expect(
      getSelectedWorkspaceWorkflowIds({
        coreWorkflows: [
          { id: 'core-1', workspaceWorkflowId: 'workspace-1' },
          { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
        ],
        selectedRowIds: ['core-2'],
      }),
    ).toEqual(['workspace-2']);
  });

  it('should skip a selected row that has no workspace workflow yet', () => {
    expect(
      getSelectedWorkspaceWorkflowIds({
        coreWorkflows: [
          { id: 'core-1', workspaceWorkflowId: null },
          { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
        ],
        selectedRowIds: ['core-1', 'core-2'],
      }),
    ).toEqual(['workspace-2']);
  });

  it('should ignore selected ids that are no longer listed', () => {
    expect(
      getSelectedWorkspaceWorkflowIds({
        coreWorkflows: [{ id: 'core-1', workspaceWorkflowId: 'workspace-1' }],
        selectedRowIds: ['core-1', 'filtered-out'],
      }),
    ).toEqual(['workspace-1']);
  });

  it('should return nothing when no row is selected', () => {
    expect(
      getSelectedWorkspaceWorkflowIds({
        coreWorkflows: [{ id: 'core-1', workspaceWorkflowId: 'workspace-1' }],
        selectedRowIds: [],
      }),
    ).toEqual([]);
  });
});
