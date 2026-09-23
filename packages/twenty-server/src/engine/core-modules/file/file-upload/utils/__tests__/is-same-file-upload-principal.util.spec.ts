import { isSameFileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/utils/is-same-file-upload-principal.util';

describe('isSameFileUploadPrincipal', () => {
  const applicationPrincipal = {
    applicationId: 'application-a',
    userWorkspaceId: 'user-workspace-1',
    apiKeyId: null,
  };

  it('should match a principal with the same application, user workspace and api key', () => {
    expect(
      isSameFileUploadPrincipal(applicationPrincipal, {
        ...applicationPrincipal,
      }),
    ).toBe(true);
  });

  it('should not match another application acting for the same user', () => {
    expect(
      isSameFileUploadPrincipal(applicationPrincipal, {
        ...applicationPrincipal,
        applicationId: 'application-b',
      }),
    ).toBe(false);
  });

  it('should not match the same application acting for another user', () => {
    expect(
      isSameFileUploadPrincipal(applicationPrincipal, {
        ...applicationPrincipal,
        userWorkspaceId: 'user-workspace-2',
      }),
    ).toBe(false);
  });

  it('should not match the plain user session behind an application principal', () => {
    expect(
      isSameFileUploadPrincipal(applicationPrincipal, {
        ...applicationPrincipal,
        applicationId: null,
      }),
    ).toBe(false);
  });

  it('should not match two api keys', () => {
    expect(
      isSameFileUploadPrincipal(
        { applicationId: null, userWorkspaceId: null, apiKeyId: 'api-key-1' },
        { applicationId: null, userWorkspaceId: null, apiKeyId: 'api-key-2' },
      ),
    ).toBe(false);
  });
});
