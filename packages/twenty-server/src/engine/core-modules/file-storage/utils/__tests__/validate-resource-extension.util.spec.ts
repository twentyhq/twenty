import { FileFolder } from 'twenty-shared/types';

import { validateResourceExtension } from 'src/engine/core-modules/file-storage/utils/validate-resource-extension.util';

describe('validateResourceExtension', () => {
  it.each([
    {
      title: 'BuiltLogicFunction with .mjs',
      resourcePath: 'src/handlers/index.mjs',
      fileFolder: FileFolder.BuiltLogicFunction,
    },
    {
      title: 'BuiltFrontComponent with .mjs',
      resourcePath: 'src/components/card.mjs',
      fileFolder: FileFolder.BuiltFrontComponent,
    },
    {
      title: 'Source with .ts',
      resourcePath: 'src/index.ts',
      fileFolder: FileFolder.Source,
    },
    {
      title: 'Source with .tsx',
      resourcePath: 'src/app.tsx',
      fileFolder: FileFolder.Source,
    },
    {
      title: 'Dependencies with .json',
      resourcePath: 'package.json',
      fileFolder: FileFolder.Dependencies,
    },
    {
      title: 'Dependencies with .lock',
      resourcePath: 'yarn.lock',
      fileFolder: FileFolder.Dependencies,
    },
    {
      title: 'PublicAsset with .svg',
      resourcePath: 'assets/logo.svg',
      fileFolder: FileFolder.PublicAsset,
    },
    {
      title: 'PublicAsset with .woff2',
      resourcePath: 'fonts/roboto.woff2',
      fileFolder: FileFolder.PublicAsset,
    },
  ])(
    'should return isValid: true for $title',
    ({ resourcePath, fileFolder }) => {
      expect(
        validateResourceExtension({ resourcePath, fileFolder }),
      ).toEqual({ isValid: true });
    },
  );

  it.each([
    {
      title: 'BuiltLogicFunction with .js',
      resourcePath: 'handler.js',
      fileFolder: FileFolder.BuiltLogicFunction,
    },
    {
      title: 'BuiltFrontComponent with .html',
      resourcePath: 'component.html',
      fileFolder: FileFolder.BuiltFrontComponent,
    },
    {
      title: 'BuiltLogicFunction with .pdf',
      resourcePath: 'handler.pdf',
      fileFolder: FileFolder.BuiltLogicFunction,
    },
    {
      title: 'PublicAsset with .js',
      resourcePath: 'assets/script.js',
      fileFolder: FileFolder.PublicAsset,
    },
    {
      title: 'Source with .mjs',
      resourcePath: 'src/index.mjs',
      fileFolder: FileFolder.Source,
    },
    {
      title: 'Dependencies with .sh',
      resourcePath: 'install.sh',
      fileFolder: FileFolder.Dependencies,
    },
  ])(
    'should return isValid: false for $title',
    ({ resourcePath, fileFolder }) => {
      const result = validateResourceExtension({ resourcePath, fileFolder });

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('Invalid file extension');
      }
    },
  );

  it.each([
    {
      title: 'CorePicture',
      resourcePath: 'photo.png',
      fileFolder: FileFolder.CorePicture,
    },
    {
      title: 'FilesField',
      resourcePath: 'document.pdf',
      fileFolder: FileFolder.FilesField,
    },
  ])(
    'should return isValid: true for unconfigured file folder $title',
    ({ resourcePath, fileFolder }) => {
      expect(
        validateResourceExtension({ resourcePath, fileFolder }),
      ).toEqual({ isValid: true });
    },
  );
});
