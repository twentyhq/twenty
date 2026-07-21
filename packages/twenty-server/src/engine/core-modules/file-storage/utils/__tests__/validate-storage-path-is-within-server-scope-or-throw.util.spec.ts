import { ServerFileFolder } from 'twenty-shared/types';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { validateStoragePathIsWithinServerScopeOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-server-scope-or-throw.util';

const primitives = {
  fileFolder: ServerFileFolder.ApplicationRegistration,
} as const;

describe('validateStoragePathIsWithinServerScopeOrThrow', () => {
  it.each([
    {
      title: 'nested path within prefix',
      onStoragePath: 'server/application-registration/manifests/manifest.json',
    },
    {
      title: 'file directly under prefix',
      onStoragePath: 'server/application-registration/manifest.json',
    },
  ])('should accept valid path: $title', ({ onStoragePath }) => {
    expect(() =>
      validateStoragePathIsWithinServerScopeOrThrow({
        onStoragePath,
        ...primitives,
      }),
    ).not.toThrow();
  });

  it.each([
    {
      title: 'workspace-like prefix instead of server prefix',
      onStoragePath: 'workspace-id/app-uid/source/file.json',
    },
    {
      title: 'different file folder',
      onStoragePath: 'server/other-folder/file.json',
    },
    {
      title: 'prefix without trailing file',
      onStoragePath: 'server/application-registration',
    },
    {
      title: 'partial prefix match (malicious suffix)',
      onStoragePath: 'server/application-registrationMalicious/file.json',
    },
    {
      title: 'traversal out of the server prefix',
      onStoragePath:
        'server/application-registration/../../workspace-id/file.json',
    },
    {
      title: 'traversal segments kept after normalization',
      onStoragePath: 'server/application-registration/../../../etc/passwd',
    },
    {
      title: 'absolute path',
      onStoragePath: '/server/application-registration/file.json',
    },
    {
      title: 'null byte in path',
      onStoragePath: 'server/application-registration/file\0.json',
    },
  ])(
    'should reject path that escapes server scope: $title',
    ({ onStoragePath }) => {
      expect(() =>
        validateStoragePathIsWithinServerScopeOrThrow({
          onStoragePath,
          ...primitives,
        }),
      ).toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        }),
      );
    },
  );
});
