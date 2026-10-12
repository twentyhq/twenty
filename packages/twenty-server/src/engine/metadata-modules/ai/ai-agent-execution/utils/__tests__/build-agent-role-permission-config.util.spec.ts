import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';

describe('buildAgentRolePermissionConfig', () => {
  it('keeps the agent role alone without restrictions', () => {
    expect(
      buildAgentRolePermissionConfig({ agentRoleId: 'agent-role-id' }),
    ).toEqual({ intersectionOf: { agent: 'agent-role-id' } });
  });

  it('bounds the agent role by the roles of the run that executes it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: 'agent-role-id',
        roleRestrictions: {
          userWorkspace: 'member-role-id',
          application: 'application-role-id',
        },
      }),
    ).toEqual({
      intersectionOf: {
        agent: 'agent-role-id',
        userWorkspace: 'member-role-id',
        application: 'application-role-id',
      },
    });
  });

  it('denies an agent without a role, whatever restricts it', () => {
    expect(
      buildAgentRolePermissionConfig({
        agentRoleId: undefined,
        roleRestrictions: { userWorkspace: 'member-role-id' },
      }),
    ).toEqual({
      intersectionOf: { agent: null, userWorkspace: 'member-role-id' },
    });
  });
});
