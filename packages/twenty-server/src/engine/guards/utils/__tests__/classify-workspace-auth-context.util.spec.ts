import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { classifyWorkspaceAuthContext } from 'src/engine/guards/utils/classify-workspace-auth-context.util';

const workspace = { id: 'workspace-id' };
const user = { id: 'user-id' };
const installedApplication = {
  id: 'application-id',
  sourceType: ApplicationRegistrationSourceType.NPM,
};
const oauthClient = {
  id: 'oauth-client-id',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
};

const memberFields = {
  workspace,
  user,
  userWorkspaceId: 'user-workspace-id',
  workspaceMemberId: 'workspace-member-id',
  workspaceMember: { id: 'workspace-member-id' },
};

const CASES: [string, object, AuthPrincipalVariant | undefined][] = [
  [
    'a member as a standard user session',
    { type: 'user', ...memberFields },
    { kind: 'userSession', variant: 'standard' },
  ],
  [
    'a member still activating the workspace as a standard user session',
    {
      type: 'pendingActivationUser',
      workspace,
      user,
      userWorkspaceId: 'user-workspace-id',
    },
    { kind: 'userSession', variant: 'standard' },
  ],
  [
    'a member acting through an installed application as that application with a user',
    { type: 'user', ...memberFields, application: installedApplication },
    { kind: 'application', variant: 'withUser', withAgent: false },
  ],
  [
    'a member a run acts as through an application as that application with a user',
    { type: 'user', ...memberFields, viaApplication: installedApplication },
    { kind: 'application', variant: 'withUser', withAgent: false },
  ],
  [
    'a member acting through an OAuth client as that client with a user',
    { type: 'user', ...memberFields, application: oauthClient },
    { kind: 'oauthClient', variant: 'withUser' },
  ],
  [
    'a member token bound to an agent but to no application as nothing',
    { type: 'user', ...memberFields, agentId: 'agent-id' },
    undefined,
  ],
  [
    'an API key',
    { type: 'apiKey', workspace, apiKey: { id: 'api-key-id' } },
    { kind: 'apiKey' },
  ],
  [
    'an installed application on its own as that application without a user',
    { type: 'application', workspace, application: installedApplication },
    { kind: 'application', variant: 'withoutUser', withAgent: false },
  ],
  [
    'an application agent running on its own as that application with an agent',
    {
      type: 'application',
      workspace,
      application: installedApplication,
      actingAgent: { id: 'agent-id', label: 'Agent' },
    },
    { kind: 'application', variant: 'withoutUser', withAgent: true },
  ],
  [
    'an OAuth client without a user',
    { type: 'application', workspace, application: oauthClient },
    { kind: 'oauthClient', variant: 'withoutUser' },
  ],
  [
    'an OAuth client bound to an agent as nothing',
    {
      type: 'application',
      workspace,
      application: oauthClient,
      agentId: 'agent-id',
    },
    undefined,
  ],
  ['the system as nothing', { type: 'system', workspace }, undefined],
];

describe('classifyWorkspaceAuthContext', () => {
  it.each(CASES)('should classify %s', (_, authContext, expected) => {
    expect(
      classifyWorkspaceAuthContext(authContext as WorkspaceAuthContext),
    ).toEqual(expected);
  });
});
