import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildFileUploadPrincipalFromAuthContext } from 'src/engine/core-modules/file/file-upload/utils/build-file-upload-principal-from-auth-context.util';

const WORKSPACE = { id: 'workspace-1' };
const USER_WORKSPACE_ID = 'user-workspace-1';
const APPLICATION_ID = 'application-1';
const API_KEY_ID = 'api-key-1';

const buildUserContext = (application?: { id: string }): WorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: WORKSPACE,
    userWorkspaceId: USER_WORKSPACE_ID,
    user: { id: 'user-1' },
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' },
    ...(application ? { application } : {}),
  }) as unknown as WorkspaceAuthContext;

describe('buildFileUploadPrincipalFromAuthContext', () => {
  it('should bind a user session to its user workspace', () => {
    expect(buildFileUploadPrincipalFromAuthContext(buildUserContext())).toEqual(
      {
        applicationId: null,
        userWorkspaceId: USER_WORKSPACE_ID,
        apiKeyId: null,
      },
    );
  });

  it('should bind an application acting for a user to both', () => {
    expect(
      buildFileUploadPrincipalFromAuthContext(
        buildUserContext({ id: APPLICATION_ID }),
      ),
    ).toEqual({
      applicationId: APPLICATION_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      apiKeyId: null,
    });
  });

  it('should bind an application acting on its own to the application', () => {
    expect(
      buildFileUploadPrincipalFromAuthContext({
        type: 'application',
        workspace: WORKSPACE,
        application: { id: APPLICATION_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual({
      applicationId: APPLICATION_ID,
      userWorkspaceId: null,
      apiKeyId: null,
    });
  });

  it('should bind an api key to the key', () => {
    expect(
      buildFileUploadPrincipalFromAuthContext({
        type: 'apiKey',
        workspace: WORKSPACE,
        apiKey: { id: API_KEY_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual({
      applicationId: null,
      userWorkspaceId: null,
      apiKeyId: API_KEY_ID,
    });
  });

  it('should bind a user pending activation to its user workspace', () => {
    expect(
      buildFileUploadPrincipalFromAuthContext({
        type: 'pendingActivationUser',
        workspace: WORKSPACE,
        userWorkspaceId: USER_WORKSPACE_ID,
        user: { id: 'user-1' },
      } as unknown as WorkspaceAuthContext),
    ).toEqual({
      applicationId: null,
      userWorkspaceId: USER_WORKSPACE_ID,
      apiKeyId: null,
    });
  });
});
