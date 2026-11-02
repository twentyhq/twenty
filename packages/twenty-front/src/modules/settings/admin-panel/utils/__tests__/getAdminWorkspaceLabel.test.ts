import { getAdminWorkspaceLabel } from '@/settings/admin-panel/utils/getAdminWorkspaceLabel';

describe('getAdminWorkspaceLabel', () => {
  it('should return the workspace name when it is set', () => {
    expect(getAdminWorkspaceLabel({ id: 'workspace-id', name: 'Apple' })).toBe(
      'Apple',
    );
  });

  it('should fall back to the workspace id when the name is missing', () => {
    expect(getAdminWorkspaceLabel({ id: 'workspace-id', name: '' })).toBe(
      'workspace-id',
    );
    expect(getAdminWorkspaceLabel({ id: 'workspace-id', name: null })).toBe(
      'workspace-id',
    );
    expect(getAdminWorkspaceLabel({ id: 'workspace-id' })).toBe('workspace-id');
  });
});
