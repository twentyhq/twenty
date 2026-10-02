import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';

describe('buildAgentRolePermissionConfig', () => {
  it('keeps the agent role alone when it runs for no principal', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        principalRoleIds: [],
      }),
    ).toEqual({ intersectionOf: ['agent-role-id'] });
  });

  it('intersects the agent role with the application it runs for', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        principalRoleIds: ['application-role-id'],
      }),
    ).toEqual({ intersectionOf: ['agent-role-id', 'application-role-id'] });
  });

  it('intersects the agent role with both the member and the application of a run-as', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        principalRoleIds: ['member-role-id', 'application-role-id'],
      }),
    ).toEqual({
      intersectionOf: [
        'agent-role-id',
        'member-role-id',
        'application-role-id',
      ],
    });
  });

  it('keeps the agent role first so explicit grants are read from it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        principalRoleIds: ['member-role-id', 'agent-role-id'],
      }).intersectionOf,
    ).toEqual(['agent-role-id', 'member-role-id']);
  });
});
