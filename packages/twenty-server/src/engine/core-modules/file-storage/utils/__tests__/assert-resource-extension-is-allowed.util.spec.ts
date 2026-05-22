import { FileFolder } from 'twenty-shared/types';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { assertResourceExtensionIsAllowed } from 'src/engine/core-modules/file-storage/utils/assert-resource-extension-is-allowed.util';

describe('assertResourceExtensionIsAllowed', () => {
  it('should accept valid extensions for BuiltLogicFunction', () => {
    expect(() =>
      assertResourceExtensionIsAllowed(
        'src/handlers/index.mjs',
        FileFolder.BuiltLogicFunction,
      ),
    ).not.toThrow();
  });

  it('should accept valid extensions for BuiltFrontComponent', () => {
    expect(() =>
      assertResourceExtensionIsAllowed(
        'src/components/card.mjs',
        FileFolder.BuiltFrontComponent,
      ),
    ).not.toThrow();
  });

  it('should accept valid extensions for Source', () => {
    expect(() =>
      assertResourceExtensionIsAllowed('src/index.ts', FileFolder.Source),
    ).not.toThrow();
    expect(() =>
      assertResourceExtensionIsAllowed('src/app.tsx', FileFolder.Source),
    ).not.toThrow();
  });

  it('should accept valid extensions for Dependencies', () => {
    expect(() =>
      assertResourceExtensionIsAllowed(
        'package.json',
        FileFolder.Dependencies,
      ),
    ).not.toThrow();
    expect(() =>
      assertResourceExtensionIsAllowed('yarn.lock', FileFolder.Dependencies),
    ).not.toThrow();
  });

  it('should accept valid extensions for PublicAsset', () => {
    expect(() =>
      assertResourceExtensionIsAllowed(
        'assets/logo.svg',
        FileFolder.PublicAsset,
      ),
    ).not.toThrow();
    expect(() =>
      assertResourceExtensionIsAllowed(
        'fonts/roboto.woff2',
        FileFolder.PublicAsset,
      ),
    ).not.toThrow();
  });

  it('should reject invalid extensions for BuiltLogicFunction', () => {
    expect(() =>
      assertResourceExtensionIsAllowed(
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
      assertResourceExtensionIsAllowed(
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
      assertResourceExtensionIsAllowed(
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
      assertResourceExtensionIsAllowed(
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
      assertResourceExtensionIsAllowed('photo.png', FileFolder.CorePicture),
    ).not.toThrow();
    expect(() =>
      assertResourceExtensionIsAllowed(
        'document.pdf',
        FileFolder.FilesField,
      ),
    ).not.toThrow();
  });
});
