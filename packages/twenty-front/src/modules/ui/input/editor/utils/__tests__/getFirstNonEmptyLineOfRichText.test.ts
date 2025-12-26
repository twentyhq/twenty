import type { PartialBlock } from '@blocknote/core';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';

describe('getFirstNonEmptyLineOfRichText', () => {
  it('should return an empty string if the input is null', () => {
    const result = getFirstNonEmptyLineOfRichText(null);
    expect(result).toBe('');
  });

  it('should return an empty string if the input is an empty array', () => {
    const result = getFirstNonEmptyLineOfRichText([]);
    expect(result).toBe('');
  });

  it('should return the first non-empty line of text', () => {
    const input: PartialBlock[] = [
      { content: [{ text: '', type: 'text', styles: {} }] },
      { content: [{ text: '   ', type: 'text', styles: {} }] },
      { content: [{ text: 'First non-empty line', type: 'text', styles: {} }] },
      { content: [{ text: 'Second line', type: 'text', styles: {} }] },
    ];
    const result = getFirstNonEmptyLineOfRichText(input);
    expect(result).toBe('First non-empty line');
  });

  it('should return an empty string if all lines are empty', () => {
    const input: PartialBlock[] = [
      { content: [{ text: '', type: 'text', styles: {} }] },
      { content: [{ text: '   ', type: 'text', styles: {} }] },
      { content: [{ text: '\n', type: 'text', styles: {} }] },
    ];
    const result = getFirstNonEmptyLineOfRichText(input);
    expect(result).toBe('');
  });

  it('should handle mixed content correctly', () => {
    const input: PartialBlock[] = [
      { content: [{ text: '', type: 'text', styles: {} }] },
      { content: [{ text: '   ', type: 'text', styles: {} }] },
      { content: [{ text: 'First non-empty line', type: 'text', styles: {} }] },
      { content: [{ text: '', type: 'text', styles: {} }] },
      {
        content: [{ text: 'Second non-empty line', type: 'text', styles: {} }],
      },
    ];
    const result = getFirstNonEmptyLineOfRichText(input);
    expect(result).toBe('First non-empty line');
  });

  it('should handle content with multiple text objects correctly', () => {
    const input: PartialBlock[] = [
      {
        content: [
          { text: '', type: 'text', styles: {} },
          { text: '   ', type: 'text', styles: {} },
        ],
      },
      {
        content: [
          { text: 'First non-empty line', type: 'text', styles: {} },
          { text: 'Second line', type: 'text', styles: {} },
        ],
      },
    ];
    const result = getFirstNonEmptyLineOfRichText(input);
    expect(result).toBe('First non-empty line');
  });

  it('should handle content with undefined or null content', () => {
    const input: PartialBlock[] = [
      { content: undefined },
      { content: [{ text: 'First non-empty line', type: 'text', styles: {} }] },
    ];
    const result = getFirstNonEmptyLineOfRichText(input);
    expect(result).toBe('First non-empty line');
  });
});
