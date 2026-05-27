import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

describe('parseInitialBlocknote', () => {
  it('should parse valid JSON array string', () => {
    const input = JSON.stringify([{ type: 'paragraph', content: 'test' }]);
    const result = parseInitialBlocknote(input);
    expect(result).toEqual([{ type: 'paragraph', content: 'test' }]);
  });

  it('should return undefined for empty string', () => {
    expect(parseInitialBlocknote('')).toBeUndefined();
  });

  it('should return undefined for null', () => {
    expect(parseInitialBlocknote(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(parseInitialBlocknote(undefined)).toBeUndefined();
  });

  it('should return undefined for empty object string "{}"', () => {
    expect(parseInitialBlocknote('{}')).toBeUndefined();
  });

  it('should return undefined for invalid JSON', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(parseInitialBlocknote('invalid json')).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should return undefined for empty array', () => {
    expect(parseInitialBlocknote('[]')).toBeUndefined();
  });

  it('should return undefined for non-array JSON', () => {
    expect(parseInitialBlocknote('{"key": "value"}')).toBeUndefined();
  });

  it('should filter invalid blocks from the parsed content', () => {
    const input = JSON.stringify([
      { type: 'paragraph', content: 'valid block' },
      null,
      { content: 'missing type' },
    ]);

    expect(parseInitialBlocknote(input)).toEqual([
      { type: 'paragraph', content: 'valid block' },
    ]);
  });

  it('should return undefined when all parsed blocks are invalid', () => {
    const input = JSON.stringify([null, { content: 'missing type' }]);

    expect(parseInitialBlocknote(input)).toBeUndefined();
  });

  it('should sanitize invalid nested children', () => {
    const input = JSON.stringify([
      {
        type: 'paragraph',
        content: 'parent',
        children: [
          { type: 'paragraph', content: 'valid child' },
          { content: 'invalid child' },
        ],
      },
    ]);

    expect(parseInitialBlocknote(input)).toEqual([
      {
        type: 'paragraph',
        content: 'parent',
        children: [
          {
            type: 'paragraph',
            content: 'valid child',
          },
        ],
      },
    ]);
  });

  it('should use custom log context when parsing fails', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    parseInitialBlocknote('invalid', 'Custom context');
    expect(consoleSpy).toHaveBeenCalledWith('Custom context');
    consoleSpy.mockRestore();
  });
});
