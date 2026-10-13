import { applyAgentRoleRestriction } from 'src/engine/core-modules/auth/utils/apply-agent-role-restriction.util';

describe('applyAgentRoleRestriction', () => {
  it('should keep the roles when no agent restricts them', () => {
    expect(
      applyAgentRoleRestriction({
        roleIds: ['user-role'],
        agentRoleId: undefined,
      }),
    ).toEqual(['user-role']);
  });

  it('should add the agent role to the roles it narrows', () => {
    expect(
      applyAgentRoleRestriction({
        roleIds: ['user-role', 'application-role'],
        agentRoleId: 'agent-role',
      }),
    ).toEqual(['user-role', 'application-role', 'agent-role']);
  });

  it('should not repeat a role the caller already has', () => {
    expect(
      applyAgentRoleRestriction({
        roleIds: ['shared-role'],
        agentRoleId: 'shared-role',
      }),
    ).toEqual(['shared-role']);
  });

  it('should deny everything for an agent without a role', () => {
    expect(
      applyAgentRoleRestriction({
        roleIds: ['user-role'],
        agentRoleId: null,
      }),
    ).toEqual([]);
  });

  it('should never stand in for a caller without roles', () => {
    expect(
      applyAgentRoleRestriction({
        roleIds: [],
        agentRoleId: 'agent-role',
      }),
    ).toEqual([]);
  });
});
