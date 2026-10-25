import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/**
 * Strips EXIF / GPS metadata segments (APP1 marker 0xFFE1) from JPEG image buffers.
 * Fixes security issue #20477: prevents leakage of sensitive GPS coordinates and camera details.
 */
function stripJpegExif(buffer: Buffer): Buffer {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer;
  }

  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let offset = 2;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      break;
    }

    const marker = buffer[offset + 1];

    if (marker === 0xd9) {
      chunks.push(Buffer.from([0xff, 0xd9]));
      break;
    }

    if (marker === 0xda) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (offset + 4 > buffer.length) {
      break;
    }

    const length = buffer.readUInt16BE(offset + 2);
    const nextOffset = offset + 2 + length;

    if (marker === 0xe1) {
      // Omit EXIF / GPS APP1 marker
    } else {
      chunks.push(buffer.subarray(offset, nextOffset));
    }

    offset = nextOffset;
  }

  return Buffer.concat(chunks);
}

export const sanitizeFile = ({
  file,
  ext,
  mimeType,
}: {
  file: Buffer | Uint8Array | string;
  ext: string;
  mimeType: string | undefined;
}): Buffer | Uint8Array | string => {
  if (ext === "svg" || mimeType === "image/svg+xml") {
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);

    let fileString: string;

    if (typeof file === "string") {
      fileString = file;
    } else if (Buffer.isBuffer(file)) {
      fileString = file.toString("utf-8");
    } else {
      fileString = Buffer.from(file).toString("utf-8");
    }

    return purify.sanitize(fileString);
  }

  if (ext === "jpg" || ext === "jpeg" || mimeType === "image/jpeg" || mimeType === "image/jpg") {
    const buffer = Buffer.isBuffer(file)
      ? file
      : typeof file === "string"
        ? Buffer.from(file, "utf-8")
        : Buffer.from(file);

    return stripJpegExif(buffer);
  }

  return file;
};
