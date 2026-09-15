import { describe, expect, it } from 'vitest';

import { extractDocumentationExamples } from '../../../../twenty-ui/docs/extractDocumentationExamples';

describe('documentation examples', () => {
  it('extracts fences with info strings, indentation, and other fence markers', () => {
    const examples = extractDocumentationExamples(
      [
        '```tsx App.tsx',
        'const app = 1;',
        '```',
        '<Tabs>',
        '  ```TSX title="Indented"',
        '  const indented = 2;',
        '  ```',
        '</Tabs>',
        '~~~ts',
        'const tilde = 3;',
        '~~~',
        '````tsx',
        '```',
        'const nested = 4;',
        '````',
        '```bash',
        'yarn add twenty-ui',
        '```',
        '```css',
        '.summary {}',
        '```',
      ].join('\n'),
    );

    expect(examples).toEqual([
      { language: 'tsx', code: 'const app = 1;\n' },
      { language: 'tsx', code: 'const indented = 2;\n' },
      { language: 'ts', code: 'const tilde = 3;\n' },
      { language: 'tsx', code: '```\nconst nested = 4;\n' },
    ]);
  });

  it('handles CRLF line endings and ignores an unterminated fence', () => {
    expect(
      extractDocumentationExamples(
        '```tsx\r\nconst app = 1;\r\n```\r\n```tsx\r\nconst open = 2;\r\n',
      ),
    ).toEqual([{ language: 'tsx', code: 'const app = 1;\n' }]);
  });
});
