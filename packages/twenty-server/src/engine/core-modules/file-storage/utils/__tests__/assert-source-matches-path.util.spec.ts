import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { assertSourceMatchesPath } from 'src/engine/core-modules/file-storage/utils/assert-source-matches-path.util';

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const pdfBuffer = Buffer.from('%PDF-1.4\n', 'utf-8');
const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const textBuffer = Buffer.from('Hello, world!', 'utf-8');

describe('assertSourceMatchesPath', () => {
  describe('string sources', () => {
    it('should skip validation for string sources (trusted internal callers)', async () => {
      await expect(
        assertSourceMatchesPath({
          sourceFile: 'export const App = () => null;',
          resourcePath: 'src/app.tsx',
        }),
      ).resolves.toBeUndefined();
    });

    it('should skip validation for arbitrary string content', async () => {
      await expect(
        assertSourceMatchesPath({
          sourceFile: '{"name": "twenty"}',
          resourcePath: 'package.json',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('buffer sources with matching magic bytes', () => {
    it.each([
      {
        name: 'PNG',
        buffer: pngBuffer,
        resourcePath: 'images/photo.png',
      },
      {
        name: 'PDF',
        buffer: pdfBuffer,
        resourcePath: 'docs/contract.pdf',
      },
      {
        name: 'ZIP',
        buffer: zipBuffer,
        resourcePath: 'archives/data.zip',
      },
    ])(
      'should accept $name buffer with matching extension',
      async ({ buffer, resourcePath }) => {
        await expect(
          assertSourceMatchesPath({
            sourceFile: buffer,
            resourcePath,
          }),
        ).resolves.toBeUndefined();
      },
    );
  });

  describe('extensions without known magic signatures', () => {
    it.each([
      { resourcePath: 'src/index.tsx' },
      { resourcePath: 'src/handler.mjs' },
      { resourcePath: 'package.json' },
      { resourcePath: 'yarn.lock' },
      { resourcePath: 'docs/README.md' },
    ])(
      'should accept text buffer for $resourcePath',
      async ({ resourcePath }) => {
        await expect(
          assertSourceMatchesPath({
            sourceFile: textBuffer,
            resourcePath,
          }),
        ).resolves.toBeUndefined();
      },
    );
  });

  describe('buffer/extension mismatches', () => {
    it('should throw when .png path has text body', async () => {
      await expect(
        assertSourceMatchesPath({
          sourceFile: textBuffer,
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });

    it('should throw when .pdf path has text body', async () => {
      await expect(
        assertSourceMatchesPath({
          sourceFile: textBuffer,
          resourcePath: 'fake-document.pdf',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });
  });

  describe('Uint8Array sources', () => {
    it('should accept matching Uint8Array source', async () => {
      const uint8 = new Uint8Array(pngBuffer);

      await expect(
        assertSourceMatchesPath({
          sourceFile: uint8,
          resourcePath: 'images/photo.png',
        }),
      ).resolves.toBeUndefined();
    });

    it('should throw on Uint8Array byte/extension mismatch', async () => {
      const uint8 = new Uint8Array(textBuffer);

      await expect(
        assertSourceMatchesPath({
          sourceFile: uint8,
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });
  });
});
