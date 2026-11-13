import { parseLegacyEmailBodyDocument } from '@/advanced-text-editor/utils/parseLegacyEmailBodyDocument';

describe('parseLegacyEmailBodyDocument', () => {
  it('keeps the line breaks of a plain-text body', () => {
    expect(
      parseLegacyEmailBodyDocument('Hi Amelia,\r\n\r\nBest,\nFélix'),
    ).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hi Amelia,' },
            { type: 'hardBreak' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Best,' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Félix' },
          ],
        },
      ],
    });
  });

  it('hands an HTML body to the editor as HTML', () => {
    const html = '<p>Hi Amelia,</p><p>Best,<br>Félix</p>';

    expect(parseLegacyEmailBodyDocument(html)).toBe(html);
  });

  it('reads a body with a stray angle bracket as plain text', () => {
    expect(parseLegacyEmailBodyDocument('Seats: 20 < 50\nThanks')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Seats: 20 < 50' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Thanks' },
          ],
        },
      ],
    });
  });
});
