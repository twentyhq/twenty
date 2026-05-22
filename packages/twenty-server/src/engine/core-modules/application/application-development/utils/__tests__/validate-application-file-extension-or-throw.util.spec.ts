import { FileFolder } from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { validateApplicationFileExtensionOrThrow } from 'src/engine/core-modules/application/application-development/utils/validate-application-file-extension-or-throw.util';

describe('validateApplicationFileExtensionOrThrow', () => {
  describe('BuiltLogicFunction', () => {
    it('should accept .mjs files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.BuiltLogicFunction,
          'src/handlers/index.mjs',
        ),
      ).not.toThrow();
    });

    it('should reject .js files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.BuiltLogicFunction,
          'src/handlers/index.js',
        ),
      ).toThrow(ApplicationException);
    });

    it('should reject .html files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.BuiltLogicFunction,
          'index.html',
        ),
      ).toThrow(ApplicationException);
    });
  });

  describe('BuiltFrontComponent', () => {
    it('should accept .mjs files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.BuiltFrontComponent,
          'src/components/card.mjs',
        ),
      ).not.toThrow();
    });

    it('should reject .tsx files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.BuiltFrontComponent,
          'src/components/card.tsx',
        ),
      ).toThrow(ApplicationException);
    });
  });

  describe('Source', () => {
    it('should accept .ts files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.Source,
          'src/index.ts',
        ),
      ).not.toThrow();
    });

    it('should accept .tsx files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.Source,
          'src/component.tsx',
        ),
      ).not.toThrow();
    });

    it('should reject .js files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.Source,
          'src/index.js',
        ),
      ).toThrow(ApplicationException);
    });
  });

  describe('Dependencies', () => {
    it('should accept .json files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.Dependencies,
          'package.json',
        ),
      ).not.toThrow();
    });

    it('should accept .lock files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.Dependencies,
          'yarn.lock',
        ),
      ).not.toThrow();
    });

    it('should reject .sh files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.Dependencies,
          'install.sh',
        ),
      ).toThrow(ApplicationException);
    });
  });

  describe('PublicAsset', () => {
    it('should accept image files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'assets/logo.png',
        ),
      ).not.toThrow();
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'assets/icon.svg',
        ),
      ).not.toThrow();
    });

    it('should accept font files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'fonts/roboto.woff2',
        ),
      ).not.toThrow();
    });

    it('should accept css files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'styles/main.css',
        ),
      ).not.toThrow();
    });

    it('should reject executable files', () => {
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'assets/script.js',
        ),
      ).toThrow(ApplicationException);
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'assets/page.html',
        ),
      ).toThrow(ApplicationException);
      expect(() =>
        validateApplicationFileExtensionOrThrow(
          FileFolder.PublicAsset,
          'assets/run.sh',
        ),
      ).toThrow(ApplicationException);
    });
  });

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
