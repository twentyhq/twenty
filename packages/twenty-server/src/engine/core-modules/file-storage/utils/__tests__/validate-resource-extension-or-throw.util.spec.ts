import { FileFolder } from 'twenty-shared/types';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { validateResourceExtensionOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-resource-extension-or-throw.util';

describe('validateResourceExtensionOrThrow', () => {
  it('should accept valid extensions for BuiltLogicFunction', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'src/handlers/index.mjs',
        FileFolder.BuiltLogicFunction,
      ),
    ).not.toThrow();
  });

  it('should accept valid extensions for BuiltFrontComponent', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'src/components/card.mjs',
        FileFolder.BuiltFrontComponent,
      ),
    ).not.toThrow();
  });

  it('should accept valid extensions for Source', () => {
    expect(() =>
      validateResourceExtensionOrThrow('src/index.ts', FileFolder.Source),
    ).not.toThrow();
    expect(() =>
      validateResourceExtensionOrThrow('src/app.tsx', FileFolder.Source),
    ).not.toThrow();
  });

  it('should accept valid extensions for Dependencies', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'package.json',
        FileFolder.Dependencies,
      ),
    ).not.toThrow();
    expect(() =>
      validateResourceExtensionOrThrow('yarn.lock', FileFolder.Dependencies),
    ).not.toThrow();
  });

  it('should accept valid extensions for PublicAsset', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'assets/logo.svg',
        FileFolder.PublicAsset,
      ),
    ).not.toThrow();
    expect(() =>
      validateResourceExtensionOrThrow(
        'fonts/roboto.woff2',
        FileFolder.PublicAsset,
      ),
    ).not.toThrow();
  });

  it('should reject invalid extensions for BuiltLogicFunction', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'handler.js',
        FileFolder.BuiltLogicFunction,
      ),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      }),
    );
  });

  it('should reject invalid extensions for BuiltFrontComponent', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'component.html',
        FileFolder.BuiltFrontComponent,
      ),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      }),
    );
  });

  it('should reject unrelated extensions like .pdf for built paths', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'handler.pdf',
        FileFolder.BuiltLogicFunction,
      ),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      }),
    );
  });

  it('should reject executable extensions for PublicAsset', () => {
    expect(() =>
      validateResourceExtensionOrThrow(
        'assets/script.js',
        FileFolder.PublicAsset,
      ),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      }),
    );
  });

  it('should not throw for file folders without configured extensions', () => {
    expect(() =>
      validateResourceExtensionOrThrow('photo.png', FileFolder.CorePicture),
    ).not.toThrow();
    expect(() =>
      validateResourceExtensionOrThrow(
        'document.pdf',
        FileFolder.FilesField,
      ),
    ).not.toThrow();
  });
});
