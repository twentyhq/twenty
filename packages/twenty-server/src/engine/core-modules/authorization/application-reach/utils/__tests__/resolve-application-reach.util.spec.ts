import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { resolveApplicationReach } from 'src/engine/core-modules/authorization/application-reach/utils/resolve-application-reach.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';
const TWENTY_STANDARD_APPLICATION_ID = 'twenty-standard-application-id';

const workspace = { id: 'workspace-id' } as WorkspaceAuthContext['workspace'];

const buildApplication = (
  id: string,
  sourceType = ApplicationRegistrationSourceType.TARBALL,
) => ({ id, sourceType }) as FlatApplication;

const installedApplication = buildApplication('installed-application-id');
const oauthOnlyApplication = buildApplication(
  'oauth-only-application-id',
  ApplicationRegistrationSourceType.OAUTH_ONLY,
);

const userAuthContext = (
  overrides: Partial<Extract<WorkspaceAuthContext, { type: 'user' }>> = {},
) =>
  ({
    type: 'user',
    workspace,
    userWorkspaceId: 'user-workspace-id',
    ...overrides,
  }) as WorkspaceAuthContext;

const applicationAuthContext = (application: FlatApplication) =>
  ({ type: 'application', workspace, application }) as WorkspaceAuthContext;

const resolve = (
  authContext: WorkspaceAuthContext,
  principal: WorkspaceAuthContextEntry['principal'] = {
    kind: 'userSession',
    variant: 'standard',
  },
) =>
  resolveApplicationReach({
    entry: { authContext, principal },
    workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
  });

describe('resolveApplicationReach', () => {
  it('should reach nothing for an unattested principal', () => {
    expect(resolve(userAuthContext(), { kind: 'unattested' })).toBeUndefined();
  });

  it('should reach the whole workspace for the system principal, whatever its auth context', () => {
    expect(
      resolve(applicationAuthContext(installedApplication), {
        kind: 'system',
        reason: 'test',
      }),
    ).toEqual({ kind: 'workspace' });
  });

  it('should reach the whole workspace for a member session', () => {
    expect(resolve(userAuthContext())).toEqual({ kind: 'workspace' });
  });

  it('should reach the whole workspace for an API key', () => {
    expect(
      resolve(
        {
          type: 'apiKey',
          workspace,
          apiKey: { id: 'api-key-id' },
        } as WorkspaceAuthContext,
        { kind: 'apiKey' },
      ),
    ).toEqual({ kind: 'workspace' });
  });

  it('should reach the whole workspace for an OAuth-only client', () => {
    expect(
      resolve(applicationAuthContext(oauthOnlyApplication), {
        kind: 'oauthClient',
        variant: 'withoutUser',
      }),
    ).toEqual({ kind: 'workspace' });
  });

  it('should confine an installed application token to its application', () => {
    expect(
      resolve(applicationAuthContext(installedApplication), {
        kind: 'application',
        variant: 'withoutUser',
        withAgent: false,
      }),
    ).toEqual({ kind: 'confined', applicationId: installedApplication.id });
  });

  it('should confine a member acting through an installed application', () => {
    expect(
      resolve(userAuthContext({ application: installedApplication }), {
        kind: 'application',
        variant: 'withUser',
        withAgent: false,
      }),
    ).toEqual({ kind: 'confined', applicationId: installedApplication.id });
  });

  it("should confine a member's run of an installed application's agent", () => {
    expect(
      resolve(userAuthContext({ viaApplication: installedApplication })),
    ).toEqual({ kind: 'confined', applicationId: installedApplication.id });
  });

  it('should let the workspace custom application compose', () => {
    expect(
      resolve(
        applicationAuthContext(
          buildApplication(WORKSPACE_CUSTOM_APPLICATION_ID),
        ),
        { kind: 'application', variant: 'withoutUser', withAgent: false },
      ),
    ).toEqual({
      kind: 'composer',
      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    });
  });

  it('should let the standard application compose, as automated workspace workflow runs act as it', () => {
    expect(
      resolve(
        applicationAuthContext(
          buildApplication(TWENTY_STANDARD_APPLICATION_ID),
        ),
        { kind: 'application', variant: 'withoutUser', withAgent: false },
      ),
    ).toEqual({
      kind: 'composer',
      applicationId: TWENTY_STANDARD_APPLICATION_ID,
    });
  });
});
