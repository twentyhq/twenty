import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';

describe('buildAgentRolePermissionConfig', () => {
  it('keeps the agent role alone when there is no run-as role', () => {
    expect(
      buildAgentRolePermissionConfig({ agentRoleId: 'agent-role-id' }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('falls back to the agent role when the run-as list is empty', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleIds: [],
      }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('uses the run-as role alone when a single one is given', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleIds: ['run-as-role-id'],
      }),
    ).toEqual({ intersectionOf: ['run-as-role-id'] });
  });

  it('intersects the member and channel roles when both are given', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleIds: ['member-role-id', 'channel-role-id'],
      }),
    ).toEqual({ intersectionOf: ['member-role-id', 'channel-role-id'] });
  });

  it('does not involve the agent role even when the run-as role equals it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        runAsRoleIds: ['agent-role-id'],
      }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });
});
