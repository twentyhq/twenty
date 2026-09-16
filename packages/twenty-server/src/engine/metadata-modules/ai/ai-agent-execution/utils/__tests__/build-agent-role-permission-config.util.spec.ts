import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';

describe('buildAgentRolePermissionConfig', () => {
  it('keeps the agent role alone when there is no run-as role', () => {
    expect(
      buildAgentRolePermissionConfig({ agentRoleId: 'agent-role-id' }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('intersects the agent role with the member role in run-as mode', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleId: 'run-as-role-id',
      }),
    ).toEqual({ intersectionOf: ['agent-role-id', 'run-as-role-id'] });
  });

  it('lists the role once when the member holds the agent role itself', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleId: 'agent-role-id',
      }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });
});
