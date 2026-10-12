import { getPlainTextFromMarkdown } from '~/utils/string/getPlainTextFromMarkdown';

describe('getPlainTextFromMarkdown', () => {
  it('removes markdown syntax', () => {
    expect(
      getPlainTextFromMarkdown(
        '## Title\n> **Bold**, *italic*, _also italic_, ~~gone~~ and `code`\n- [link](https://twenty.com)',
      ),
    ).toBe('Title Bold, italic, also italic, gone and code link');
  });

  it('keeps characters that are not markdown syntax', () => {
    expect(
      getPlainTextFromMarkdown(
        'Mail john_doe@example.com about https://my_repo.com/doc#usage in C#, 2 * 3',
      ),
    ).toBe(
      'Mail john_doe@example.com about https://my_repo.com/doc#usage in C#, 2 * 3',
    );
  });

  it('drops code blocks and keeps list and table text', () => {
    expect(
      getPlainTextFromMarkdown(
        '1. first\n2. second\n\n```ts\nconst x = 1;\n```\n\n| Name | Stage |\n| --- | --- |\n| Acme | Won |',
      ),
    ).toBe('first second Name Stage Acme Won');
  });

  it('keeps unclosed syntax from text cut short', () => {
    expect(getPlainTextFromMarkdown('![chart](https://x.png) half **bro')).toBe(
      'chart half **bro',
    );
  });
});
