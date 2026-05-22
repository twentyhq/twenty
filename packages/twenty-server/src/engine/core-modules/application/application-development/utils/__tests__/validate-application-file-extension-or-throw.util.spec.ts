import { FileFolder } from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { validateApplicationFileExtensionOrThrow } from 'src/engine/core-modules/application/application-development/utils/validate-application-file-extension-or-throw.util';

describe('validateApplicationFileExtensionOrThrow', () => {
  it.each([
    {
      title: 'BuiltLogicFunction with .mjs',
      fileFolder: FileFolder.BuiltLogicFunction,
      filePath: 'src/handlers/index.mjs',
    },
    {
      title: 'BuiltFrontComponent with .mjs',
      fileFolder: FileFolder.BuiltFrontComponent,
      filePath: 'src/components/card.mjs',
    },
    {
      title: 'Source with .ts',
      fileFolder: FileFolder.Source,
      filePath: 'src/index.ts',
    },
    {
      title: 'Source with .tsx',
      fileFolder: FileFolder.Source,
      filePath: 'src/component.tsx',
    },
    {
      title: 'Dependencies with .json',
      fileFolder: FileFolder.Dependencies,
      filePath: 'package.json',
    },
    {
      title: 'Dependencies with .lock',
      fileFolder: FileFolder.Dependencies,
      filePath: 'yarn.lock',
    },
    {
      title: 'PublicAsset with .png',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'assets/logo.png',
    },
    {
      title: 'PublicAsset with .svg',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'assets/icon.svg',
    },
    {
      title: 'PublicAsset with .woff2',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'fonts/roboto.woff2',
    },
    {
      title: 'PublicAsset with .css',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'styles/main.css',
    },
  ])(
    'should accept valid extension for $title',
    ({ fileFolder, filePath }) => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(fileFolder, filePath),
      ).not.toThrow();
    },
  );

  it.each([
    {
      title: 'BuiltLogicFunction with .js',
      fileFolder: FileFolder.BuiltLogicFunction,
      filePath: 'src/handlers/index.js',
    },
    {
      title: 'BuiltLogicFunction with .html',
      fileFolder: FileFolder.BuiltLogicFunction,
      filePath: 'index.html',
    },
    {
      title: 'BuiltFrontComponent with .tsx',
      fileFolder: FileFolder.BuiltFrontComponent,
      filePath: 'src/components/card.tsx',
    },
    {
      title: 'Source with .js',
      fileFolder: FileFolder.Source,
      filePath: 'src/index.js',
    },
    {
      title: 'Dependencies with .sh',
      fileFolder: FileFolder.Dependencies,
      filePath: 'install.sh',
    },
    {
      title: 'PublicAsset with .js',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'assets/script.js',
    },
    {
      title: 'PublicAsset with .html',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'assets/page.html',
    },
    {
      title: 'PublicAsset with .sh',
      fileFolder: FileFolder.PublicAsset,
      filePath: 'assets/run.sh',
    },
  ])(
    'should reject invalid extension for $title',
    ({ fileFolder, filePath }) => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(fileFolder, filePath),
      ).toThrow(ApplicationException);
    },
  );

  it('should throw for a file folder with no configured extensions', () => {
    expect(() =>
      validateApplicationFileExtensionOrThrow(
        FileFolder.CorePicture,
        'photo.png',
      ),
    ).toThrow(ApplicationException);
  });

  it('should include allowed extensions in error message', () => {
    try {
      validateApplicationFileExtensionOrThrow(
        FileFolder.BuiltLogicFunction,
        'index.js',
      );
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect((error as ApplicationException).code).toBe(
        ApplicationExceptionCode.INVALID_INPUT,
      );
      expect((error as ApplicationException).message).toContain('.mjs');
    }
  });
});
