import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const pdfBuffer = Buffer.from('%PDF-1.4\n', 'utf-8');
const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const textBuffer = Buffer.from('Hello, world!', 'utf-8');

const benignSvg =
  '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10" /></svg>';
const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><circle r="10" /></svg>`;

describe('prepareFileForStorageOrThrow', () => {
  describe('mime resolution', () => {
    it.each([
      {
        name: 'TypeScript .ts string (policy)',
        sourceFile: 'export const x = 1;',
        resourcePath: 'src/index.ts',
        expectedMime: 'application/typescript',
      },
      {
        name: 'TypeScript .tsx string (policy)',
        sourceFile: 'export const App = () => null;',
        resourcePath: 'src/App.tsx',
        expectedMime: 'application/typescript',
      },
      {
        name: '.mjs string (mrmime)',
        sourceFile: 'export default 1;',
        resourcePath: 'src/handler.mjs',
        expectedMime: 'text/javascript',
      },
      {
        name: 'JSON string (mrmime)',
        sourceFile: '{"foo": "bar"}',
        resourcePath: 'package.json',
        expectedMime: 'application/json',
      },
      {
        name: 'unknown-extension string (octet-stream)',
        sourceFile: 'lock content',
        resourcePath: 'yarn.lock',
        expectedMime: 'application/octet-stream',
      },
      {
        name: 'no-extension string (octet-stream)',
        sourceFile: 'content',
        resourcePath: 'somefile',
        expectedMime: 'application/octet-stream',
      },
      {
        name: 'dot-file string (octet-stream — extname semantics)',
        sourceFile: 'content',
        resourcePath: '.gitignore',
        expectedMime: 'application/octet-stream',
      },
    ])(
      'returns $expectedMime for $name',
      async ({ sourceFile, resourcePath, expectedMime }) => {
        const { mimeType } = await prepareFileForStorageOrThrow({
          sourceFile,
          resourcePath,
        });

        expect(mimeType).toBe(expectedMime);
      },
    );

    it.each([
      {
        name: 'PNG buffer',
        sourceFile: pngBuffer,
        resourcePath: 'images/photo.png',
        expectedMime: 'image/png',
      },
      {
        name: 'PDF buffer',
        sourceFile: pdfBuffer,
        resourcePath: 'docs/contract.pdf',
        expectedMime: 'application/pdf',
      },
      {
        name: 'ZIP buffer',
        sourceFile: zipBuffer,
        resourcePath: 'archives/data.zip',
        expectedMime: 'application/zip',
      },
    ])(
      'returns the bytes-derived mime for $name',
      async ({ sourceFile, resourcePath, expectedMime }) => {
        const { mimeType } = await prepareFileForStorageOrThrow({
          sourceFile,
          resourcePath,
        });

        expect(mimeType).toBe(expectedMime);
      },
    );

    it('returns the bytes-derived mime for a Uint8Array source', async () => {
      const { mimeType } = await prepareFileForStorageOrThrow({
        sourceFile: new Uint8Array(pngBuffer),
        resourcePath: 'images/photo.png',
      });

      expect(mimeType).toBe('image/png');
    });
  });

  describe('binary-extension backstop', () => {
    it('throws when a buffer with a binary extension does not match the magic bytes', async () => {
      await expect(
        prepareFileForStorageOrThrow({
          sourceFile: textBuffer,
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });

    it('throws when a string with a binary extension does not match the magic bytes', async () => {
      await expect(
        prepareFileForStorageOrThrow({
          sourceFile: 'this is not a png',
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });

    it('throws on Uint8Array byte/extension mismatch', async () => {
      await expect(
        prepareFileForStorageOrThrow({
          sourceFile: new Uint8Array(textBuffer),
          resourcePath: 'fake-image.pdf',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });
  });

  describe('SVG sanitization', () => {
    it('sanitizes an SVG string by removing scripts and event handlers', async () => {
      const { sourceFile, mimeType } = await prepareFileForStorageOrThrow({
        sourceFile: maliciousSvg,
        resourcePath: 'assets/icon.svg',
      });

      expect(mimeType).toBe('image/svg+xml');
      expect(typeof sourceFile).toBe('string');
      expect(sourceFile).not.toContain('<script>');
      expect(sourceFile).not.toContain('onload');
      expect(sourceFile).toContain('<circle');
    });

    it('sanitizes an SVG buffer (DOMPurify returns a string)', async () => {
      const { sourceFile, mimeType } = await prepareFileForStorageOrThrow({
        sourceFile: Buffer.from(maliciousSvg, 'utf-8'),
        resourcePath: 'assets/icon.svg',
      });

      expect(mimeType).toBe('image/svg+xml');
      expect(typeof sourceFile).toBe('string');
      expect(sourceFile).not.toContain('<script>');
      expect(sourceFile).not.toContain('onload');
    });

    it('preserves a benign SVG (no destructive sanitization)', async () => {
      const { sourceFile } = await prepareFileForStorageOrThrow({
        sourceFile: benignSvg,
        resourcePath: 'assets/icon.svg',
      });

      expect(sourceFile).toContain('<circle');
      expect(sourceFile).toContain('xmlns');
    });
  });

  describe('non-SVG content is returned unchanged', () => {
    it('returns the original buffer reference for a non-SVG buffer', async () => {
      const { sourceFile } = await prepareFileForStorageOrThrow({
        sourceFile: pngBuffer,
        resourcePath: 'images/photo.png',
      });

      expect(sourceFile).toBe(pngBuffer);
    });

    it('returns the original string for a non-SVG string', async () => {
      const original = '{"foo": "bar"}';

      const { sourceFile } = await prepareFileForStorageOrThrow({
        sourceFile: original,
        resourcePath: 'package.json',
      });

      expect(sourceFile).toBe(original);
    });
  });
});
