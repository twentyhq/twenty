import { getFirstNonEmptyLineOfRichText } from '../getFirstNonEmptyLineOfRichText';

describe('getFirstNonEmptyLineOfRichText', () => {
  it('handles a plain string leaf without crashing', () => {
    const blocks = [{ content: ['S'] as any[] }] as any;
    expect(() => getFirstNonEmptyLineOfRichText(blocks)).not.toThrow();
    expect(getFirstNonEmptyLineOfRichText(blocks)).toBe('S');
  });

  it('returns link when present', () => {
    const blocks = [{ content: [{ link: 'https://example.com' }] }] as any;
    expect(getFirstNonEmptyLineOfRichText(blocks)).toBe('https://example.com');
  });

  it('returns trimmed text when present', () => {
    const blocks = [{ content: [{ text: '  hello  ' }] }] as any;
    expect(getFirstNonEmptyLineOfRichText(blocks)).toBe('hello');
  });
});