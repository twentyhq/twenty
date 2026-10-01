import { stripMarkdown } from '~/utils/string/stripMarkdown';

describe('stripMarkdown', () => {
  it('removes markdown syntax', () => {
    expect(
      stripMarkdown(
        '## Title\n> **Bold**, *italic*, _also italic_, ~~gone~~ and `code`\n- [link](https://twenty.com)',
      ),
    ).toBe('Title Bold, italic, also italic, gone and code link');
  });

  it('keeps characters that are not markdown syntax', () => {
    expect(
      stripMarkdown(
        'Mail john_doe@example.com about https://my_repo.com/doc#usage in C#, 2 * 3',
      ),
    ).toBe(
      'Mail john_doe@example.com about https://my_repo.com/doc#usage in C#, 2 * 3',
    );
  });
});
