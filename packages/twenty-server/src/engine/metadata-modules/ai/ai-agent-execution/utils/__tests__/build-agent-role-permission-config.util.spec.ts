import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';

describe('buildAgentRolePermissionConfig', () => {
  it('keeps the agent role alone when there is no run-as role', () => {
    expect(
      buildAgentRolePermissionConfig({ agentRoleId: 'agent-role-id' }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('uses the member role alone in run-as mode', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleId: 'run-as-role-id',
      }),
    ).toEqual({ intersectionOf: ['run-as-role-id'] });
  });

  it('does not involve the agent role even when the member holds it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleId: 'agent-role-id',
      }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('bounds the agent role by the roles of the run that executes it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        executionRoleIds: ['member-role-id', 'application-role-id'],
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
        executionRoleIds: ['application-role-id'],
      }),
    ).toEqual({ intersectionOf: ['application-role-id'] });
  });
});
