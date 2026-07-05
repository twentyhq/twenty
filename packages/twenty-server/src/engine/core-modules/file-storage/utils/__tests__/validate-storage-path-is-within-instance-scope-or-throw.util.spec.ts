import { FileFolder } from 'twenty-shared/types';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { validateStoragePathIsWithinInstanceScopeOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-instance-scope-or-throw.util';

const primitives = {
  fileFolder: FileFolder.Source,
};

describe('validateStoragePathIsWithinInstanceScopeOrThrow', () => {
  it.each([
    {
      title: 'nested path within prefix',
      onStoragePath: 'instance/source/manifests/manifest.json',
    },
    {
      title: 'file directly under prefix',
      onStoragePath: 'instance/source/manifest.json',
    },
  ])('should accept valid path: $title', ({ onStoragePath }) => {
    expect(() =>
      validateStoragePathIsWithinInstanceScopeOrThrow({
        onStoragePath,
        ...primitives,
      }),
    ).not.toThrow();
  });

  it.each([
    {
      title: 'workspace-like prefix instead of instance prefix',
      onStoragePath: 'workspace-id/app-uid/source/file.json',
    },
    {
      title: 'different file folder',
      onStoragePath: 'instance/other-folder/file.json',
    },
    {
      title: 'prefix without trailing file',
      onStoragePath: 'instance/source',
    },
    {
      title: 'partial prefix match (malicious suffix)',
      onStoragePath: 'instance/sourceMalicious/file.json',
    },
    {
      title: 'traversal out of the instance prefix',
      onStoragePath: 'instance/source/../../workspace-id/file.json',
    },
    {
      title: 'traversal segments kept after normalization',
      onStoragePath: 'instance/source/../../../etc/passwd',
    },
    {
      title: 'absolute path',
      onStoragePath: '/instance/source/file.json',
    },
    {
      title: 'null byte in path',
      onStoragePath: 'instance/source/file\0.json',
    },
  ])(
    'should reject path that escapes instance scope: $title',
    ({ onStoragePath }) => {
      expect(() =>
        validateStoragePathIsWithinInstanceScopeOrThrow({
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
