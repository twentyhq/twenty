import { FileFolder } from 'twenty-shared/types';

import { validateResourcePath } from 'src/engine/core-modules/file-storage/utils/validate-resource-path.util';

describe('validateResourcePath', () => {
  it.each([
    {
      title: 'valid built logic function path',
      resourcePath: 'src/handlers/index.mjs',
      fileFolder: FileFolder.BuiltLogicFunction,
    },
    {
      title: 'valid source path',
      resourcePath: 'src/index.ts',
      fileFolder: FileFolder.Source,
    },
    {
      title: 'valid public asset path',
      resourcePath: 'assets/logo.svg',
      fileFolder: FileFolder.PublicAsset,
    },
    {
      title: 'valid dependencies path',
      resourcePath: 'package.json',
      fileFolder: FileFolder.Dependencies,
    },
    {
      title: 'valid unconfigured folder',
      resourcePath: 'photo.png',
      fileFolder: FileFolder.CorePicture,
    },
  ])(
    'should return isValid: true for $title',
    ({ resourcePath, fileFolder }) => {
      expect(validateResourcePath({ resourcePath, fileFolder })).toEqual({
        isValid: true,
      });
    },
  );

  it('should fail on path traversal (safe relative path check)', () => {
    const result = validateResourcePath({
      resourcePath: '../../../etc/passwd',
      fileFolder: FileFolder.BuiltLogicFunction,
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('unsafe characters or path traversal');
    }
  });

  it('should fail on invalid characters (filename integrity check)', () => {
    const result = validateResourcePath({
      resourcePath: 'my folder/file.mjs',
      fileFolder: FileFolder.BuiltLogicFunction,
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('invalid characters');
    }
  });

  it('should fail on missing extension (filename integrity check)', () => {
    const result = validateResourcePath({
      resourcePath: 'Makefile',
      fileFolder: FileFolder.BuiltLogicFunction,
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('must have an extension');
    }
  });

  it('should fail on wrong extension (resource extension check)', () => {
    const result = validateResourcePath({
      resourcePath: 'handler.js',
      fileFolder: FileFolder.BuiltLogicFunction,
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('Invalid file extension');
    }
  });

  it('should short-circuit on the first failure', () => {
    const result = validateResourcePath({
      resourcePath: '',
      fileFolder: FileFolder.BuiltLogicFunction,
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('unsafe characters or path traversal');
    }
  });
});
