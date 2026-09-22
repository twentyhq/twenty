import { getNavigationMenuItemTargetRecordId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemTargetRecordId';

describe('getNavigationMenuItemTargetRecordId', () => {
  it('stores the core workflow id for a workflow', () => {
    expect(
      getNavigationMenuItemTargetRecordId({
        objectNameSingular: 'workflow',
        record: {
          id: 'workspace-workflow-id',
          coreWorkflowId: 'core-workflow-id',
        },
      }),
    ).toBe('core-workflow-id');
  });

  it('falls back to the workspace id when the workflow has no core pointer', () => {
    expect(
      getNavigationMenuItemTargetRecordId({
        objectNameSingular: 'workflow',
        record: { id: 'workspace-workflow-id', coreWorkflowId: null },
      }),
    ).toBe('workspace-workflow-id');
  });

  it('stores the record id for every other object', () => {
    expect(
      getNavigationMenuItemTargetRecordId({
        objectNameSingular: 'company',
        record: { id: 'company-id', coreWorkflowId: 'core-workflow-id' },
      }),
    ).toBe('company-id');
  });
});
