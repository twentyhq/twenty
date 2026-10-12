import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findRequestAgentRoleRestriction } from 'src/engine/core-modules/auth/utils/find-request-agent-role-restriction.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const APPLICATION_ID = 'application-1';
const AGENT_ROLE_RESTRICTION = { agentId: 'agent-1', roleId: 'agent-role-1' };

const USER_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: USER_WORKSPACE_ID,
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
  application: { id: APPLICATION_ID },
  agentRoleRestriction: AGENT_ROLE_RESTRICTION,
} as unknown as WorkspaceAuthContext;

const APPLICATION_CONTEXT = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { id: APPLICATION_ID },
  agentRoleRestriction: AGENT_ROLE_RESTRICTION,
} as unknown as WorkspaceAuthContext;

const findWithin = (
  authContext: WorkspaceAuthContext,
  principal: Parameters<typeof findRequestAgentRoleRestriction>[0],
) =>
  withWorkspaceAuthContext(authContext, () =>
    findRequestAgentRoleRestriction(principal),
  );

describe('findRequestAgentRoleRestriction', () => {
  it('should find nothing outside a request', () => {
    expect(
      findRequestAgentRoleRestriction({
        userWorkspaceId: USER_WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      }),
    ).toBeUndefined();
  });

  it.each([
    {
      title: 'the token user',
      authContext: USER_CONTEXT,
      principal: {
        userWorkspaceId: USER_WORKSPACE_ID,
        applicationId: undefined,
      },
    },
    {
      title: 'the application of a user token',
      authContext: USER_CONTEXT,
      principal: { applicationId: APPLICATION_ID },
    },
    {
      title: 'the token application',
      authContext: APPLICATION_CONTEXT,
      principal: { applicationId: APPLICATION_ID },
    },
  ])('should narrow a check about $title', ({ authContext, principal }) => {
    expect(findWithin(authContext, principal)).toEqual(AGENT_ROLE_RESTRICTION);
  });

  it.each([
    {
      title: 'another user',
      authContext: USER_CONTEXT,
      principal: {
        userWorkspaceId: 'other-user-workspace',
        applicationId: APPLICATION_ID,
      },
    },
    {
      title: 'a user of an application token',
      authContext: APPLICATION_CONTEXT,
      principal: {
        userWorkspaceId: USER_WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      },
    },
    {
      title: 'another application',
      authContext: APPLICATION_CONTEXT,
      principal: { applicationId: 'other-application' },
    },
    {
      title: 'an API key',
      authContext: APPLICATION_CONTEXT,
      principal: { apiKeyId: 'api-key-1', applicationId: APPLICATION_ID },
    },
  ])(
    'should leave a check about $title untouched',
    ({ authContext, principal }) => {
      expect(findWithin(authContext, principal)).toBeUndefined();
    },
  );
});
