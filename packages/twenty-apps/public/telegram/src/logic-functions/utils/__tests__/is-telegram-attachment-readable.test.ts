import { describe, expect, it } from 'vitest';

import { TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/telegram-assistant-max-attachment-size-bytes';
import { isTelegramAttachmentReadable } from 'src/logic-functions/utils/is-telegram-attachment-readable';

describe('isTelegramAttachmentReadable', () => {
  it.each([
    { mimeType: 'image/jpeg', sizeBytes: 5000 },
    { mimeType: 'application/pdf', sizeBytes: undefined },
    {
      mimeType: 'image/png',
      sizeBytes: TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES,
    },
  ])('accepts $mimeType of $sizeBytes bytes', (attachment) => {
    expect(isTelegramAttachmentReadable(attachment)).toBe(true);
  });

  it.each([
    { mimeType: undefined, sizeBytes: 5000 },
    { mimeType: 'video/mp4', sizeBytes: 5000 },
    {
      mimeType: 'application/pdf',
      sizeBytes: TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES + 1,
    },
  ])('refuses $mimeType of $sizeBytes bytes', (attachment) => {
    expect(isTelegramAttachmentReadable(attachment)).toBe(false);
  });
});
