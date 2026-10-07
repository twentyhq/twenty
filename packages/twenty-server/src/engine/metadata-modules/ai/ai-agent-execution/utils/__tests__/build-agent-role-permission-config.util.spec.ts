import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';

describe('buildAgentRolePermissionConfig', () => {
  it('keeps the agent role alone without restrictions', () => {
    expect(
      buildAgentRolePermissionConfig({ agentRoleId: 'agent-role-id' }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('bounds the agent role by the roles of the run that executes it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        additionalRoleRestrictionIds: ['member-role-id', 'application-role-id'],
      }),
    ).toEqual({
      intersectionOf: [
        'agent-role-id',
        'member-role-id',
        'application-role-id',
      ],
    });
  });

  it('does not repeat a role shared by the agent and the run', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'application-role-id',
        additionalRoleRestrictionIds: ['application-role-id'],
      }),
    ).toEqual({ intersectionOf: ['application-role-id'] });
  });

  it('reads nothing for an agent without a role, whatever restricts it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: undefined,
        additionalRoleRestrictionIds: ['member-role-id'],
      }),
    ).toEqual({ intersectionOf: [] });
  });
});
