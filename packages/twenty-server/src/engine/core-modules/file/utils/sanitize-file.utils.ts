import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const stripExifFromJpeg = (data: Buffer): Buffer => {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
    return data;
  }

  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let pos = 2;
  const len = data.length;

  while (pos < len) {
    if (data[pos] !== 0xff) {
      chunks.push(data.subarray(pos));
      break;
    }

    const marker = data[pos + 1];

    if (marker === 0xd9) {
      // EOI (End of Image)
      chunks.push(data.subarray(pos, pos + 2));
      break;
    }

    if (marker === 0xda) {
      // SOS (Start of Scan): entropy-coded image data follows to end
      chunks.push(data.subarray(pos));
      break;
    }

    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      // Standalone markers without length
      chunks.push(data.subarray(pos, pos + 2));
      pos += 2;
      continue;
    }

    if (marker === 0x00 || marker === 0xff) {
      pos += 1;
      continue;
    }

    if (pos + 4 > len) {
      chunks.push(data.subarray(pos));
      break;
    }

    const segLen = (data[pos + 2] << 8) | data[pos + 3];
    const segEnd = pos + 2 + segLen;

    // 0xE1 is APP1 (EXIF / XMP)
    if (marker === 0xe1) {
      pos = segEnd;
    } else {
      chunks.push(data.subarray(pos, segEnd));
      pos = segEnd;
    }
  }

  return Buffer.concat(chunks);
};

const stripExifFromPng = (data: Buffer): Buffer => {
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (data.length < 8 || !data.subarray(0, 8).equals(pngSig)) {
    return data;
  }

  const chunks: Buffer[] = [pngSig];
  let pos = 8;
  const len = data.length;

  while (pos + 12 <= len) {
    const chunkLen = data.readUInt32BE(pos);
    const chunkType = data.subarray(pos + 4, pos + 8).toString('ascii');
    const chunkEnd = pos + 12 + chunkLen;

    // Strip EXIF and ancillary metadata chunks: eXIf, tEXt, zTXt, iTXt
    if (
      chunkType === 'eXIf' ||
      chunkType === 'tEXt' ||
      chunkType === 'zTXt' ||
      chunkType === 'iTXt'
    ) {
      pos = chunkEnd;
    } else {
      chunks.push(data.subarray(pos, chunkEnd));
      pos = chunkEnd;
      if (chunkType === 'IEND') {
        break;
      }
    }
  }

  if (pos < len) {
    chunks.push(data.subarray(pos));
  }

  return Buffer.concat(chunks);
};

export const sanitizeFile = ({
  file,
  ext,
  mimeType,
}: {
  file: Buffer | Uint8Array | string;
  ext: string;
  mimeType: string | undefined;
}): Buffer | Uint8Array | string => {
  if (ext === 'svg' || mimeType === 'image/svg+xml') {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    let fileString: string;

    if (typeof file === 'string') {
      fileString = file;
    } else if (Buffer.isBuffer(file)) {
      fileString = file.toString('utf-8');
    } else {
      fileString = Buffer.from(file).toString('utf-8');
    }

    return purify.sanitize(fileString);
  }

  const normalizedExt = ext.toLowerCase();
  const normalizedMime = mimeType?.toLowerCase();

  const isJpeg =
    normalizedExt === 'jpg' ||
    normalizedExt === 'jpeg' ||
    normalizedMime === 'image/jpeg' ||
    normalizedMime === 'image/jpg';

  if (isJpeg) {
    const buffer = Buffer.isBuffer(file)
      ? file
      : typeof file === 'string'
        ? Buffer.from(file, 'binary')
        : Buffer.from(file);

    return stripExifFromJpeg(buffer);
  }

  const isPng = normalizedExt === 'png' || normalizedMime === 'image/png';

  if (isPng) {
    const buffer = Buffer.isBuffer(file)
      ? file
      : typeof file === 'string'
        ? Buffer.from(file, 'binary')
        : Buffer.from(file);

    return stripExifFromPng(buffer);
  }

  return file;
};
