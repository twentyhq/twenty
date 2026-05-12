import { stripJpegExifMetadata } from '../strip-jpeg-exif-metadata.utils';

const buildSegment = (marker: number, payload: number[]): number[] => {
  const segmentLength = payload.length + 2;

  return [0xff, marker, segmentLength >> 8, segmentLength & 0xff, ...payload];
};

const jpegWithExif = Buffer.from([
  0xff,
  0xd8,
  ...buildSegment(0xe1, [
    0x45,
    0x78,
    0x69,
    0x66,
    0x00,
    0x00,
    0x47,
    0x50,
    0x53,
    0x44,
    0x41,
    0x54,
    0x41,
  ]),
  ...buildSegment(0xfe, [0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74]),
  0xff,
  0xda,
  0x00,
  0x01,
  0x02,
  0x03,
  0xff,
  0xd9,
]);

describe('stripJpegExifMetadata', () => {
  it('should remove APP1 Exif metadata from jpeg files', () => {
    const sanitizedBuffer = stripJpegExifMetadata(jpegWithExif);

    expect(sanitizedBuffer.includes(Buffer.from('Exif\u0000\u0000', 'ascii'))).toBe(
      false,
    );
    expect(sanitizedBuffer.includes(Buffer.from('comment', 'ascii'))).toBe(true);
    expect(sanitizedBuffer.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
  });

  it('should return original file when jpeg payload is malformed', () => {
    const malformedJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00]);

    expect(stripJpegExifMetadata(malformedJpegBuffer)).toBe(malformedJpegBuffer);
  });
});
