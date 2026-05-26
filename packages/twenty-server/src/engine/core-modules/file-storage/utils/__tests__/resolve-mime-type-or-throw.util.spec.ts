import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { resolveMimeTypeOrThrow } from 'src/engine/core-modules/file-storage/utils/resolve-mime-type-or-throw.util';

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const pdfBuffer = Buffer.from('%PDF-1.4\n', 'utf-8');
const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const textBuffer = Buffer.from('Hello, world!', 'utf-8');

describe('resolveMimeTypeOrThrow', () => {
  describe('string sources', () => {
    it.each([
      {
        name: 'TypeScript .ts (policy override of IANA video/mp2t)',
        resourcePath: 'src/index.ts',
        expectedMime: 'application/typescript',
      },
      {
        name: 'TypeScript .tsx (policy fills gap mrmime leaves empty)',
        resourcePath: 'src/index.tsx',
        expectedMime: 'application/typescript',
      },
      {
        name: '.mjs (mrmime — already RFC 9239 text/javascript)',
        resourcePath: 'src/handler.mjs',
        expectedMime: 'text/javascript',
      },
      {
        name: 'JSON (mrmime — IANA registered)',
        resourcePath: 'package.json',
        expectedMime: 'application/json',
      },
      {
        name: 'Markdown (mrmime — IANA registered)',
        resourcePath: 'docs/README.md',
        expectedMime: 'text/markdown',
      },
    ])(
      'should return $expectedMime for $name',
      async ({ resourcePath, expectedMime }) => {
        const result = await resolveMimeTypeOrThrow({
          sourceFile: 'arbitrary text content',
          resourcePath,
        });

        expect(result).toBe(expectedMime);
      },
    );

    it('should return application/octet-stream for unknown extensions', async () => {
      const result = await resolveMimeTypeOrThrow({
        sourceFile: 'lock content',
        resourcePath: 'yarn.lock',
      });

      expect(result).toBe('application/octet-stream');
    });

    it('should return application/octet-stream when path has no extension', async () => {
      const result = await resolveMimeTypeOrThrow({
        sourceFile: 'content',
        resourcePath: 'somefile',
      });

      expect(result).toBe('application/octet-stream');
    });

    it('should return application/octet-stream for dot-files (extname considers no extension)', async () => {
      const result = await resolveMimeTypeOrThrow({
        sourceFile: 'content',
        resourcePath: '.gitignore',
      });

      expect(result).toBe('application/octet-stream');
    });

    it('should throw when a string is paired with a binary extension whose bytes do not match', async () => {
      await expect(
        resolveMimeTypeOrThrow({
          sourceFile: 'this is not a png',
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });
  });

  describe('buffer sources with matching magic bytes', () => {
    it.each([
      {
        name: 'PNG',
        buffer: pngBuffer,
        resourcePath: 'images/photo.png',
        expectedMime: 'image/png',
      },
      {
        name: 'PDF',
        buffer: pdfBuffer,
        resourcePath: 'docs/contract.pdf',
        expectedMime: 'application/pdf',
      },
      {
        name: 'ZIP',
        buffer: zipBuffer,
        resourcePath: 'archives/data.zip',
        expectedMime: 'application/zip',
      },
    ])(
      'should return the bytes-derived mime for $name',
      async ({ buffer, resourcePath, expectedMime }) => {
        const result = await resolveMimeTypeOrThrow({
          sourceFile: buffer,
          resourcePath,
        });

        expect(result).toBe(expectedMime);
      },
    );
  });

  describe('buffer sources falling back through the policy', () => {
    it('should return application/typescript for a text buffer with a .ts path (policy beats mrmime collision)', async () => {
      const result = await resolveMimeTypeOrThrow({
        sourceFile: textBuffer,
        resourcePath: 'src/index.ts',
      });

      expect(result).toBe('application/typescript');
    });

    it('should return text/markdown for a text buffer with a .md path (mrmime fallback)', async () => {
      const result = await resolveMimeTypeOrThrow({
        sourceFile: textBuffer,
        resourcePath: 'docs/README.md',
      });

      expect(result).toBe('text/markdown');
    });
  });

  describe('buffer/extension mismatches', () => {
    it('should throw when .png path has text body', async () => {
      await expect(
        resolveMimeTypeOrThrow({
          sourceFile: textBuffer,
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });

    it('should throw when .pdf path has text body', async () => {
      await expect(
        resolveMimeTypeOrThrow({
          sourceFile: textBuffer,
          resourcePath: 'fake-document.pdf',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });
  });

  describe('Uint8Array sources', () => {
    it('should return the bytes-derived mime for a matching Uint8Array source', async () => {
      const uint8 = new Uint8Array(pngBuffer);

      const result = await resolveMimeTypeOrThrow({
        sourceFile: uint8,
        resourcePath: 'images/photo.png',
      });

      expect(result).toBe('image/png');
    });

    it('should throw on Uint8Array byte/extension mismatch', async () => {
      const uint8 = new Uint8Array(textBuffer);

      await expect(
        resolveMimeTypeOrThrow({
          sourceFile: uint8,
          resourcePath: 'fake-image.png',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.INVALID_EXTENSION,
      });
    });
  });
});
