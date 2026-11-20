import { describe, expect, it } from 'vitest';
import { getEditedMessageText } from 'src/logic-functions/data/get-edited-message-text.util';

describe('getEditedMessageText', () => {
  it('should return the body of an edited text message', () => {
    expect(getEditedMessageText({ type: 'text', text: { body: 'Updated text' } })).toBe('Updated text');
  });

  it('should return the caption of edited media', () => {
    expect(
      getEditedMessageText({
        type: 'video',
        video: { id: 'media-id', mime_type: 'video/mp4', sha256: 'hash', caption: 'Updated caption' },
      }),
    ).toBe('Updated caption');
  });
});
