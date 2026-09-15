import { FileFolder } from 'twenty-shared/types';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { validateStoragePathIsWithinWorkspaceOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-workspace-or-throw.util';

const primitives = {
  workspaceId: 'workspace-id',
  applicationUniversalIdentifier: 'app-uid',
  fileFolder: FileFolder.BuiltFrontComponent,
};

describe('validateStoragePathIsWithinWorkspaceOrThrow', () => {
  it.each([
    {
      title: 'nested path within prefix',
      onStoragePath:
        'workspace-id/app-uid/built-front-component/src/component.mjs',
    },
    {
      title: 'file directly under prefix',
      onStoragePath: 'workspace-id/app-uid/built-front-component/file.mjs',
    },
  ])('should accept valid path: $title', ({ onStoragePath }) => {
    expect(() =>
      validateStoragePathIsWithinWorkspaceOrThrow({
        onStoragePath,
        ...primitives,
      }),
    ).not.toThrow();
  });

  it.each([
    {
      title: 'different workspace and app',
      onStoragePath:
        'other-workspace/other-app/built-front-component/stolen.mjs',
    },
    {
      title: 'different file folder',
      onStoragePath: 'workspace-id/app-uid/other-folder/file.mjs',
    },
    {
      title: 'prefix without trailing file',
      onStoragePath: 'workspace-id/app-uid/built-front-component',
    },
    {
      title: 'partial prefix match (malicious suffix)',
      onStoragePath:
        'workspace-id/app-uid/built-front-componentMalicious/file.mjs',
    },
  ])(
    'should reject path that escapes workspace: $title',
    ({ onStoragePath }) => {
      expect(() =>
        validateStoragePathIsWithinWorkspaceOrThrow({
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
