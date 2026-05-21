import { FileFolder } from 'twenty-shared/types';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { assertStoragePathIsWithinWorkspace } from 'src/engine/core-modules/file-storage/utils/assert-storage-path-is-within-workspace.util';

const primitives = {
  workspaceId: 'workspace-id',
  applicationUniversalIdentifier: 'app-uid',
  fileFolder: FileFolder.BuiltFrontComponent,
};

describe('assertStoragePathIsWithinWorkspace', () => {
  it('should accept paths within the expected prefix', () => {
    expect(() =>
      assertStoragePathIsWithinWorkspace({
        onStoragePath:
          'workspace-id/app-uid/built-front-component/src/component.mjs',
        ...primitives,
      }),
    ).not.toThrow();
  });

  it('should accept paths directly under the prefix', () => {
    expect(() =>
      assertStoragePathIsWithinWorkspace({
        onStoragePath: 'workspace-id/app-uid/built-front-component/file.mjs',
        ...primitives,
      }),
    ).not.toThrow();
  });

  it('should reject paths that escape via .. traversal', () => {
    expect(() =>
      assertStoragePathIsWithinWorkspace({
        onStoragePath:
          'other-workspace/other-app/built-front-component/stolen.mjs',
        ...primitives,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths that escape by one level', () => {
    expect(() =>
      assertStoragePathIsWithinWorkspace({
        onStoragePath: 'workspace-id/app-uid/other-folder/file.mjs',
        ...primitives,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject the prefix itself without a trailing file', () => {
    expect(() =>
      assertStoragePathIsWithinWorkspace({
        onStoragePath: 'workspace-id/app-uid/built-front-component',
        ...primitives,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths where prefix is a partial match', () => {
    expect(() =>
      assertStoragePathIsWithinWorkspace({
        onStoragePath:
          'workspace-id/app-uid/built-front-componentMalicious/file.mjs',
        ...primitives,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });
});
