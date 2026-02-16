import { buildRoleMaps } from '@/settings/roles/role-assignment/utils/build-role-maps';

describe('buildRoleMaps', () => {
  it('should build member map from roles', () => {
    const roles = [
      {
        id: 'role-1',
        label: 'Admin',
        workspaceMembers: [{ id: 'member-1' }, { id: 'member-2' }],
      },
    ] as any;

    const result = buildRoleMaps(roles);

    expect(result.member.get('member-1')).toEqual({
      id: 'role-1',
      label: 'Admin',
    });
    expect(result.member.get('member-2')).toEqual({
      id: 'role-1',
      label: 'Admin',
    });
  });

  it('should build agent map from roles', () => {
    const roles = [
      {
        id: 'role-1',
        label: 'Admin',
        workspaceMembers: [],
        agents: [{ id: 'agent-1' }],
      },
    ] as any;

    const result = buildRoleMaps(roles);

    expect(result.agent.get('agent-1')).toEqual({
      id: 'role-1',
      label: 'Admin',
    });
  });

  it('should build apiKey map from roles', () => {
    const roles = [
      {
        id: 'role-1',
        label: 'Admin',
        workspaceMembers: [],
        apiKeys: [{ id: 'key-1' }],
      },
    ] as any;

    const result = buildRoleMaps(roles);

    expect(result.apiKey.get('key-1')).toEqual({
      id: 'role-1',
      label: 'Admin',
    });
  });

  it('should return empty maps for empty roles', () => {
    const result = buildRoleMaps([]);

    expect(result.member.size).toBe(0);
    expect(result.agent.size).toBe(0);
    expect(result.apiKey.size).toBe(0);
  });

  it('should handle multiple roles correctly', () => {
    const roles = [
      {
        id: 'role-1',
        label: 'Admin',
        workspaceMembers: [{ id: 'member-1' }],
      },
      {
        id: 'role-2',
        label: 'Viewer',
        workspaceMembers: [{ id: 'member-2' }],
      },
    ] as any;

    const result = buildRoleMaps(roles);

    expect(result.member.get('member-1')?.label).toBe('Admin');
    expect(result.member.get('member-2')?.label).toBe('Viewer');
  });
});
