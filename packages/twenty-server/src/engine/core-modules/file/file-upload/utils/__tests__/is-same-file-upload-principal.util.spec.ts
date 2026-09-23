import { isSameFileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/utils/is-same-file-upload-principal.util';

describe('isSameFileUploadPrincipal', () => {
  const applicationPrincipal = {
    applicationId: 'application-a',
    userWorkspaceId: 'user-workspace-1',
    apiKeyId: null,
  };

  const userPrincipal = {
    applicationId: null,
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

  it('should match the same application acting for another user', () => {
    expect(
      isSameFileUploadPrincipal(applicationPrincipal, {
        ...applicationPrincipal,
        userWorkspaceId: 'user-workspace-2',
      }),
    ).toBe(true);
  });

  it('should match the same application acting without a user', () => {
    expect(
      isSameFileUploadPrincipal(applicationPrincipal, {
        ...applicationPrincipal,
        userWorkspaceId: null,
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

  it('should not match the plain user session behind an application principal', () => {
    expect(isSameFileUploadPrincipal(applicationPrincipal, userPrincipal)).toBe(
      false,
    );
  });

  it('should not match an application acting for the user who started the upload', () => {
    expect(isSameFileUploadPrincipal(userPrincipal, applicationPrincipal)).toBe(
      false,
    );
  });

  it('should not match another user', () => {
    expect(
      isSameFileUploadPrincipal(userPrincipal, {
        ...userPrincipal,
        userWorkspaceId: 'user-workspace-2',
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
