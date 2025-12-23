import { parseInitialBlocknote } from '@/ui/input/editor/utils/parseInitialBlocknote';

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

  it('should use custom log context when parsing fails', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    parseInitialBlocknote('invalid', 'Custom context');
    expect(consoleSpy).toHaveBeenCalledWith('Custom context');
    consoleSpy.mockRestore();
  });
});
