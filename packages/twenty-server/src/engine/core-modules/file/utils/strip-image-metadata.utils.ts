/**
 * Removes embedded metadata (EXIF, GPS, XMP, IPTC, comments) from raster
 * images without decoding or re-encoding them.
 *
 * Why byte-level instead of an image library:
 * - `sharp` is a native dependency and is not part of the server's dependency
 *   set; pulling it in for a metadata strip would be a large supply-chain and
 *   build-surface increase.
 * - The metadata we must remove lives in well-defined container segments, so
 *   dropping those segments is exact and lossless for the pixel data.
 *
 * Supported containers: JPEG, PNG, WebP. Anything else is returned untouched.
 */

const JPEG_SOI = 0xffd8;
const JPEG_APP1 = 0xffe1;
const JPEG_APP13 = 0xffed; // Photoshop IRB / IPTC
const JPEG_COM = 0xfffe; // Free-form comment
const JPEG_SOS = 0xffda; // Start of scan: entropy-coded data follows

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// PNG chunks that can carry metadata.
const PNG_METADATA_CHUNKS = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']);

const WEBP_RIFF = Buffer.from('RIFF', 'ascii');
const WEBP_WEBP = Buffer.from('WEBP', 'ascii');

// WebP chunks that can carry metadata.
const WEBP_METADATA_CHUNKS = new Set(['EXIF', 'XMP ']);

const startsWith = (buffer: Buffer, prefix: Buffer): boolean =>
  buffer.length >= prefix.length && buffer.subarray(0, prefix.length).equals(prefix);

/**
 * JPEG is a sequence of segments. Metadata lives in APP1 (Exif/XMP),
 * APP13 (IPTC) and COM. We copy every other segment verbatim and stop
 * rewriting once the scan begins, since entropy-coded data is not segmented.
 */
const stripJpegMetadata = (file: Buffer): Buffer => {
  // A JPEG needs at least SOI plus one segment header; anything shorter is
  // malformed and must be returned untouched rather than truncated.
  if (file.length < 6) {
    return file;
  }

  const output: Buffer[] = [file.subarray(0, 2)];

  let offset = 2;

  while (offset + 4 <= file.length) {
    const marker = file.readUInt16BE(offset);

    // Not a marker: the stream is malformed, keep the rest as-is.
    if ((marker & 0xff00) !== 0xff00) {
      output.push(file.subarray(offset));

      return Buffer.concat(output);
    }

    // Start of scan: everything from here on is image data.
    if (marker === JPEG_SOS) {
      output.push(file.subarray(offset));

      return Buffer.concat(output);
    }

    const segmentLength = file.readUInt16BE(offset + 2);

    // A segment must be at least 2 bytes (its own length field).
    if (segmentLength < 2 || offset + 2 + segmentLength > file.length) {
      output.push(file.subarray(offset));

      return Buffer.concat(output);
    }

    const isMetadataSegment =
      marker === JPEG_APP1 || marker === JPEG_APP13 || marker === JPEG_COM;

    if (!isMetadataSegment) {
      output.push(file.subarray(offset, offset + 2 + segmentLength));
    }

    offset += 2 + segmentLength;
  }

  return Buffer.concat(output);
};

/**
 * PNG is a signature followed by length-prefixed chunks. We drop the metadata
 * chunks and keep the rest, including the trailing IEND.
 */
const stripPngMetadata = (file: Buffer): Buffer => {
  const output: Buffer[] = [file.subarray(0, PNG_SIGNATURE.length)];

  let offset = PNG_SIGNATURE.length;

  while (offset + 8 <= file.length) {
    const chunkLength = file.readUInt32BE(offset);
    const chunkType = file.subarray(offset + 4, offset + 8).toString('ascii');

    // 4 length + 4 type + data + 4 CRC.
    const chunkEnd = offset + 8 + chunkLength + 4;

    if (chunkEnd > file.length) {
      output.push(file.subarray(offset));

      return Buffer.concat(output);
    }

    if (!PNG_METADATA_CHUNKS.has(chunkType)) {
      output.push(file.subarray(offset, chunkEnd));
    }

    offset = chunkEnd;
  }

  return Buffer.concat(output);
};

/**
 * WebP is a RIFF container: "RIFF" + size + "WEBP" + chunks. Each chunk is
 * four ASCII bytes, a little-endian size, the payload, and a pad byte when the
 * payload length is odd. Dropping a chunk means rewriting the RIFF size.
 */
const stripWebpMetadata = (file: Buffer): Buffer => {
  const chunks: Buffer[] = [];

  let offset = 12; // RIFF header + WEBP fourcc.

  while (offset + 8 <= file.length) {
    const chunkType = file.subarray(offset, offset + 4).toString('ascii');
    const chunkLength = file.readUInt32LE(offset + 4);

    const paddedLength = chunkLength + (chunkLength % 2);
    const chunkEnd = offset + 8 + paddedLength;

    if (chunkEnd > file.length) {
      chunks.push(file.subarray(offset));

      break;
    }

    if (!WEBP_METADATA_CHUNKS.has(chunkType)) {
      chunks.push(file.subarray(offset, chunkEnd));
    }

    offset = chunkEnd;
  }

  const body = Buffer.concat(chunks);

  const header = Buffer.alloc(12);

  WEBP_RIFF.copy(header, 0);
  header.writeUInt32LE(body.length + 4, 4); // +4 for the "WEBP" fourcc.
  WEBP_WEBP.copy(header, 8);

  return Buffer.concat([header, body]);
};

/**
 * Strips embedded metadata from a raster image.
 *
 * @returns A new buffer without metadata, or the original buffer when the
 *          format is unsupported or the input is not a valid container.
 */
export const stripImageMetadata = (file: Buffer): Buffer => {
  if (file.length >= 2 && file.readUInt16BE(0) === JPEG_SOI) {
    return stripJpegMetadata(file);
  }

  if (startsWith(file, PNG_SIGNATURE)) {
    return stripPngMetadata(file);
  }

  if (
    file.length >= 12 &&
    startsWith(file, WEBP_RIFF) &&
    file.subarray(8, 12).equals(WEBP_WEBP)
  ) {
    return stripWebpMetadata(file);
  }

  return file;
};

/**
 * Whether the MIME type is a raster image whose metadata we can strip.
 */
export const isMetadataStrippableImageMimeType = (mimeType: string): boolean =>
  mimeType === 'image/jpeg' ||
  mimeType === 'image/png' ||
  mimeType === 'image/webp';
