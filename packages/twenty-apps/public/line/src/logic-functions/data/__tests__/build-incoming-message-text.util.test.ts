import { describe, expect, it } from 'vitest';

import { buildIncomingMessageText } from 'src/logic-functions/data/build-incoming-message-text.util';

describe('buildIncomingMessageText', () => {
  it('keeps the text of a text message', () => {
    expect(
      buildIncomingMessageText({ id: '1', type: 'text', text: 'Hello' }),
    ).toBe('Hello');
  });

  it('shows a sticker with its text when LINE gives one', () => {
    expect(
      buildIncomingMessageText({
        id: '1',
        type: 'sticker',
        packageId: '1',
        stickerId: '2',
        text: 'Thanks',
      }),
    ).toBe('[Sticker] Thanks');
    expect(
      buildIncomingMessageText({
        id: '1',
        type: 'sticker',
        packageId: '1',
        stickerId: '2',
      }),
    ).toBe('[Sticker]');
  });

  it('describes a location with its place and coordinates', () => {
    expect(
      buildIncomingMessageText({
        id: '1',
        type: 'location',
        title: 'Tokyo Tower',
        address: '4-2-8 Shibakoen',
        latitude: 35.6586,
        longitude: 139.7454,
      }),
    ).toBe('Location: Tokyo Tower, 4-2-8 Shibakoen (35.6586, 139.7454)');
    expect(
      buildIncomingMessageText({
        id: '1',
        type: 'location',
        latitude: 1,
        longitude: 2,
      }),
    ).toBe('Location: (1, 2)');
  });

  it('names the file of a file message', () => {
    expect(
      buildIncomingMessageText({
        id: '1',
        type: 'file',
        fileName: 'quote.pdf',
        fileSize: 100,
      }),
    ).toBe('[File] quote.pdf');
  });
});
