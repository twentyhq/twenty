import { getDeletableSelectedCoreWorkflows } from '@/object-core/workflows/utils/getDeletableSelectedCoreWorkflows';

describe('getDeletableSelectedCoreWorkflows', () => {
  it('should pair the selected rows with their workspace workflow', () => {
    expect(
      getDeletableSelectedCoreWorkflows({
        coreWorkflows: [
          { id: 'core-1', workspaceWorkflowId: 'workspace-1' },
          { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
        ],
        selectedRowIds: ['core-2'],
      }),
    ).toEqual([
      { coreWorkflowId: 'core-2', workspaceWorkflowId: 'workspace-2' },
    ]);
  });

  it('should skip a selected row that has no workspace workflow yet', () => {
    expect(
      getDeletableSelectedCoreWorkflows({
        coreWorkflows: [
          { id: 'core-1', workspaceWorkflowId: null },
          { id: 'core-2', workspaceWorkflowId: 'workspace-2' },
        ],
        selectedRowIds: ['core-1', 'core-2'],
      }),
    ).toEqual([
      { coreWorkflowId: 'core-2', workspaceWorkflowId: 'workspace-2' },
    ]);
  });

  it('should ignore selected ids that are no longer listed', () => {
    expect(
      getDeletableSelectedCoreWorkflows({
        coreWorkflows: [{ id: 'core-1', workspaceWorkflowId: 'workspace-1' }],
        selectedRowIds: ['core-1', 'filtered-out'],
      }),
    ).toEqual([
      { coreWorkflowId: 'core-1', workspaceWorkflowId: 'workspace-1' },
    ]);
  });

  it('should return nothing when no row is selected', () => {
    expect(
      getDeletableSelectedCoreWorkflows({
        coreWorkflows: [{ id: 'core-1', workspaceWorkflowId: 'workspace-1' }],
        selectedRowIds: [],
      }),
    ).toEqual([]);
  });
});
