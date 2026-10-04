import {
  isMetadataStrippableImageMimeType,
  stripImageMetadata,
} from 'src/engine/core-modules/file/utils/strip-image-metadata.utils';

/**
 * Builds a minimal but structurally valid JPEG: SOI, an APP1 segment carrying
 * an Exif payload, a COM segment, and a scan.
 */
const buildJpegWithExif = (exifPayload: Buffer): Buffer => {
  const app1Length = exifPayload.length + 2;
  const app1 = Buffer.alloc(4 + exifPayload.length);

  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(app1Length, 2);
  exifPayload.copy(app1, 4);

  const comment = Buffer.from('a comment', 'ascii');
  const com = Buffer.alloc(4 + comment.length);

  com.writeUInt16BE(0xfffe, 0);
  com.writeUInt16BE(comment.length + 2, 2);
  comment.copy(com, 4);

  const scan = Buffer.from([0xff, 0xda, 0x00, 0x02, 0x11, 0x22, 0x33]);

  return Buffer.concat([Buffer.from([0xff, 0xd8]), app1, com, scan]);
};

const buildPngChunk = (
  type: string,
  data: Buffer,
): Buffer => {
  const chunk = Buffer.alloc(12 + data.length);

  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 'ascii');
  data.copy(chunk, 8);
  chunk.writeUInt32BE(0, 8 + data.length); // CRC placeholder.

  return chunk;
};

const buildPngWithMetadata = (): Buffer => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return Buffer.concat([
    signature,
    buildPngChunk('IHDR', Buffer.alloc(13)),
    buildPngChunk('eXIf', Buffer.from('gps-data', 'ascii')),
    buildPngChunk('tEXt', Buffer.from('Author\0someone', 'ascii')),
    buildPngChunk('IDAT', Buffer.from([0x01, 0x02, 0x03])),
    buildPngChunk('IEND', Buffer.alloc(0)),
  ]);
};

const buildWebpChunk = (type: string, data: Buffer): Buffer => {
  const paddedLength = data.length + (data.length % 2);
  const chunk = Buffer.alloc(8 + paddedLength);

  chunk.write(type, 0, 'ascii');
  chunk.writeUInt32LE(data.length, 4);
  data.copy(chunk, 8);

  return chunk;
};

const buildWebpWithMetadata = (): Buffer => {
  const body = Buffer.concat([
    buildWebpChunk('VP8 ', Buffer.from([0x01, 0x02, 0x03, 0x04])),
    buildWebpChunk('EXIF', Buffer.from('gps-data', 'ascii')),
    buildWebpChunk('XMP ', Buffer.from('xmp-data', 'ascii')),
  ]);

  const header = Buffer.alloc(12);

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(body.length + 4, 4);
  header.write('WEBP', 8, 'ascii');

  return Buffer.concat([header, body]);
};

describe('stripImageMetadata', () => {
  describe('JPEG', () => {
    it('should drop the APP1 and COM segments while keeping the scan', () => {
      const jpeg = buildJpegWithExif(Buffer.from('Exif\0\0gps', 'ascii'));

      const stripped = stripImageMetadata(jpeg);

      expect(stripped.length).toBeLessThan(jpeg.length);
      expect(stripped.readUInt16BE(0)).toBe(0xffd8);
      expect(stripped.includes(Buffer.from('Exif', 'ascii'))).toBe(false);
      expect(stripped.includes(Buffer.from('a comment', 'ascii'))).toBe(false);
      // The scan marker must survive so the image stays decodable.
      expect(stripped.includes(Buffer.from([0xff, 0xda]))).toBe(true);
    });

    it('should return the same bytes when there is no metadata segment', () => {
      const scan = Buffer.from([0xff, 0xda, 0x00, 0x02, 0x11]);
      const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8]), scan]);

      expect(stripImageMetadata(jpeg).equals(jpeg)).toBe(true);
    });
  });

  describe('PNG', () => {
    it('should drop eXIf and tEXt chunks while keeping IHDR, IDAT and IEND', () => {
      const png = buildPngWithMetadata();

      const stripped = stripImageMetadata(png);

      expect(stripped.length).toBeLessThan(png.length);
      expect(stripped.includes(Buffer.from('eXIf', 'ascii'))).toBe(false);
      expect(stripped.includes(Buffer.from('tEXt', 'ascii'))).toBe(false);
      expect(stripped.includes(Buffer.from('IHDR', 'ascii'))).toBe(true);
      expect(stripped.includes(Buffer.from('IDAT', 'ascii'))).toBe(true);
      expect(stripped.includes(Buffer.from('IEND', 'ascii'))).toBe(true);
    });

    it('should preserve the PNG signature', () => {
      const png = buildPngWithMetadata();

      const stripped = stripImageMetadata(png);

      expect(
        stripped
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      ).toBe(true);
    });
  });

  describe('WebP', () => {
    it('should drop EXIF and XMP chunks and fix the RIFF size', () => {
      const webp = buildWebpWithMetadata();

      const stripped = stripImageMetadata(webp);

      expect(stripped.length).toBeLessThan(webp.length);
      expect(stripped.includes(Buffer.from('EXIF', 'ascii'))).toBe(false);
      expect(stripped.includes(Buffer.from('XMP ', 'ascii'))).toBe(false);
      expect(stripped.includes(Buffer.from('VP8 ', 'ascii'))).toBe(true);
      expect(stripped.readUInt32LE(4)).toBe(stripped.length - 8);
    });
  });

  describe('unsupported input', () => {
    it('should return the buffer untouched for a non-image payload', () => {
      const pdf = Buffer.from('%PDF-1.7 some content', 'ascii');

      expect(stripImageMetadata(pdf).equals(pdf)).toBe(true);
    });

    it('should return the buffer untouched for a truncated JPEG', () => {
      const truncated = Buffer.from([0xff, 0xd8, 0xff]);

      expect(stripImageMetadata(truncated).equals(truncated)).toBe(true);
    });
  });
});

describe('isMetadataStrippableImageMimeType', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'should accept %s',
    (mimeType) => {
      expect(isMetadataStrippableImageMimeType(mimeType)).toBe(true);
    },
  );

  it.each(['image/svg+xml', 'application/pdf', 'image/gif', 'text/plain'])(
    'should reject %s',
    (mimeType) => {
      expect(isMetadataStrippableImageMimeType(mimeType)).toBe(false);
    },
  );
});
