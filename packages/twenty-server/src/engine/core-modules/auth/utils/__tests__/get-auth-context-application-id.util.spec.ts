import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getAuthContextApplicationId } from 'src/engine/core-modules/auth/utils/get-auth-context-application-id.util';

describe('getAuthContextApplicationId', () => {
  it('should name the application of an application context', () => {
    expect(
      getAuthContextApplicationId({
        type: 'application',
        workspace: { id: 'workspace-1' },
        application: { id: 'app-1' },
      } as WorkspaceAuthContext),
    ).toBe('app-1');
  });

  it('should name the application an application token is serving a person through', () => {
    expect(
      getAuthContextApplicationId({
        type: 'user',
        workspace: { id: 'workspace-1' },
        application: { id: 'app-1' },
      } as WorkspaceAuthContext),
    ).toBe('app-1');
  });

  it('should name no application for an ordinary session', () => {
    expect(
      getAuthContextApplicationId({
        type: 'user',
        workspace: { id: 'workspace-1' },
      } as WorkspaceAuthContext),
    ).toBeUndefined();
  });

  it('should name no application for an api key', () => {
    expect(
      getAuthContextApplicationId({
        type: 'apiKey',
        workspace: { id: 'workspace-1' },
        apiKey: { id: 'api-key-1' },
      } as WorkspaceAuthContext),
    ).toBeUndefined();
  });
});
