import { describe, expect, it } from 'vitest';

import { buildOutgoingImageMessageOrThrow } from 'src/logic-functions/data/build-outgoing-image-message-or-throw.util';

const IMAGE = {
  filename: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 2 * 1024 * 1024,
  downloadUrl: 'https://acme.twenty.com/files/photo.jpg?token=abc',
};

describe('buildOutgoingImageMessageOrThrow', () => {
  it('sends a JPEG or PNG as an image fetched from its signed URL', () => {
    expect(buildOutgoingImageMessageOrThrow(IMAGE)).toEqual({
      type: 'image',
      originalContentUrl: IMAGE.downloadUrl,
      previewImageUrl: IMAGE.downloadUrl,
    });
    expect(
      buildOutgoingImageMessageOrThrow({
        ...IMAGE,
        contentType: 'image/png; charset=binary',
      }).type,
    ).toBe('image');
  });

  it('refuses a file LINE cannot show as an image', () => {
    expect(() =>
      buildOutgoingImageMessageOrThrow({
        ...IMAGE,
        filename: 'quote.pdf',
        contentType: 'application/pdf',
      }),
    ).toThrow('JPEG or PNG images only');
    expect(() =>
      buildOutgoingImageMessageOrThrow({ ...IMAGE, contentType: 'image/gif' }),
    ).toThrow('JPEG or PNG images only');
  });

  it('refuses an image larger than 10 MB', () => {
    expect(() =>
      buildOutgoingImageMessageOrThrow({ ...IMAGE, size: 11 * 1024 * 1024 }),
    ).toThrow('up to 10 MB');
  });

  it('refuses an image LINE cannot fetch over HTTPS', () => {
    expect(() =>
      buildOutgoingImageMessageOrThrow({
        ...IMAGE,
        downloadUrl: 'http://localhost:3000/files/photo.jpg',
      }),
    ).toThrow('public HTTPS address');
    expect(() =>
      buildOutgoingImageMessageOrThrow({
        ...IMAGE,
        downloadUrl: `https://acme.twenty.com/${'a'.repeat(2000)}`,
      }),
    ).toThrow('public HTTPS address');
  });
});
