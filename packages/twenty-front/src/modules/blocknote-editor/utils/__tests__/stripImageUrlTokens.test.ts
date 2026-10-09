import { stripImageUrlTokens } from '@/blocknote-editor/utils/stripImageUrlTokens';

describe('stripImageUrlTokens', () => {
  it('should return empty string as-is', () => {
    expect(stripImageUrlTokens('')).toBe('');
  });

  it('should pass through non-image blocks unchanged', () => {
    const blocks = [
      { type: 'paragraph', content: 'text' },
      { type: 'heading', content: 'title' },
      { type: 'image', props: { alt: 'no url' } },
    ];

    expect(JSON.parse(stripImageUrlTokens(JSON.stringify(blocks)))).toEqual(
      blocks,
    );
  });

  it('should make two signatures of the same image identical', () => {
    const signedWith = (token: string) =>
      JSON.stringify([
        {
          type: 'image',
          props: {
            url: `https://example.com/file/files-field/file-id?token=${token}`,
          },
        },
      ]);

    expect(stripImageUrlTokens(signedWith('first'))).toBe(
      stripImageUrlTokens(signedWith('second')),
    );
    expect(JSON.parse(stripImageUrlTokens(signedWith('first')))).toEqual([
      {
        type: 'image',
        props: { url: 'https://example.com/file/files-field/file-id' },
      },
    ]);
  });

  it('should keep a malformed image URL', () => {
    const input = JSON.stringify([
      { type: 'image', props: { url: 'not-a-url' } },
    ]);

    expect(JSON.parse(stripImageUrlTokens(input))).toEqual([
      { type: 'image', props: { url: 'not-a-url' } },
    ]);
  });
});
