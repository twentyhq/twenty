import { describe, expect, it } from 'vitest';

import { getOutgoingAttachmentTypeOrThrow } from 'src/logic-functions/data/get-outgoing-attachment-type-or-throw.util';

const MEGABYTE = 1024 * 1024;

describe('getOutgoingAttachmentTypeOrThrow', () => {
  it.each([
    ['image/png', 'image'],
    ['video/mp4', 'video'],
    ['audio/mpeg', 'audio'],
    ['application/pdf', 'file'],
  ])('sends %s as %s', (contentType, attachmentType) => {
    expect(
      getOutgoingAttachmentTypeOrThrow({
        filename: 'attachment',
        contentType,
        size: MEGABYTE,
      }),
    ).toBe(attachmentType);
  });

  it('refuses an image over 8 MB', () => {
    expect(() =>
      getOutgoingAttachmentTypeOrThrow({
        filename: 'photo.png',
        contentType: 'image/png',
        size: 9 * MEGABYTE,
      }),
    ).toThrow('photo.png is too large for Messenger');
  });

  it('accepts a 20 MB document but refuses 26 MB', () => {
    expect(
      getOutgoingAttachmentTypeOrThrow({
        filename: 'deck.pdf',
        contentType: 'application/pdf',
        size: 20 * MEGABYTE,
      }),
    ).toBe('file');
    expect(() =>
      getOutgoingAttachmentTypeOrThrow({
        filename: 'deck.pdf',
        contentType: 'application/pdf',
        size: 26 * MEGABYTE,
      }),
    ).toThrow('up to 25 MB');
  });
});
