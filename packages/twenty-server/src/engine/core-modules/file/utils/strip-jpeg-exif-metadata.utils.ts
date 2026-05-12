const JPEG_SOI_MARKER = 0xd8;
const JPEG_EOI_MARKER = 0xd9;
const JPEG_SOS_MARKER = 0xda;
const JPEG_APP1_MARKER = 0xe1;
const EXIF_IDENTIFIER = Buffer.from('Exif\u0000\u0000', 'ascii');

const isStandaloneMarker = (marker: number): boolean => {
  return marker >= 0xd0 && marker <= 0xd7;
};

const isExifSegment = (segment: Buffer): boolean => {
  return (
    segment.length >= EXIF_IDENTIFIER.length &&
    segment.subarray(0, EXIF_IDENTIFIER.length).equals(EXIF_IDENTIFIER)
  );
};

export const stripJpegExifMetadata = (file: Buffer): Buffer => {
  if (
    file.length < 4 ||
    file[0] !== 0xff ||
    file[1] !== JPEG_SOI_MARKER ||
    file[2] !== 0xff
  ) {
    return file;
  }

  const strippedChunks = [file.subarray(0, 2)];
  let cursor = 2;

  while (cursor < file.length) {
    if (file[cursor] !== 0xff) {
      return file;
    }

    const marker = file[cursor + 1];

    if (marker === undefined) {
      return file;
    }

    if (marker === JPEG_EOI_MARKER) {
      strippedChunks.push(file.subarray(cursor, cursor + 2));

      return Buffer.concat(strippedChunks);
    }

    if (marker === JPEG_SOS_MARKER) {
      strippedChunks.push(file.subarray(cursor));

      return Buffer.concat(strippedChunks);
    }

    if (isStandaloneMarker(marker)) {
      strippedChunks.push(file.subarray(cursor, cursor + 2));
      cursor += 2;

      continue;
    }

    if (cursor + 3 >= file.length) {
      return file;
    }

    const segmentLength = file.readUInt16BE(cursor + 2);

    if (segmentLength < 2) {
      return file;
    }

    const segmentStart = cursor + 4;
    const segmentEnd = cursor + 2 + segmentLength;

    if (segmentEnd > file.length) {
      return file;
    }

    const segmentData = file.subarray(segmentStart, segmentEnd);

    if (!(marker === JPEG_APP1_MARKER && isExifSegment(segmentData))) {
      strippedChunks.push(file.subarray(cursor, segmentEnd));
    }

    cursor = segmentEnd;
  }

  return Buffer.concat(strippedChunks);
};
