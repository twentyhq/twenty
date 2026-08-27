import { describe, expect, it } from 'vitest';

import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';
import { serializeRichTextMarkdown } from 'src/front-components/utils/serialize-rich-text-markdown.util';

describe('serializeRichTextMarkdown', () => {
  it('wraps markdown into the stored rich text shape', () => {
    expect(serializeRichTextMarkdown('Write terse notes.')).toBe(
      '{"blocknote":null,"markdown":"Write terse notes."}',
    );
  });

  it('serializes an empty prompt as an empty value', () => {
    expect(serializeRichTextMarkdown('')).toBe('');
  });

  it('round-trips through the reader used by the summary prompt', () => {
    expect(
      extractRichTextMarkdown(serializeRichTextMarkdown('Focus on decisions.')),
    ).toBe('Focus on decisions.');
  });
});
