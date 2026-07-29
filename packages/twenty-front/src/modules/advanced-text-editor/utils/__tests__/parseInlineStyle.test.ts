/* oxlint-disable twenty/no-hardcoded-colors -- test fixtures are literal inline CSS */
import { parseInlineStyle } from '@/advanced-text-editor/utils/parseInlineStyle';
import { serializeInlineStyle } from '@/advanced-text-editor/utils/serializeInlineStyle';

describe('parseInlineStyle', () => {
  it('should parse declarations into a property map', () => {
    expect(
      parseInlineStyle('background-color: #ffffff; padding: 12px'),
    ).toEqual({
      'background-color': '#ffffff',
      padding: '12px',
    });
  });

  it('should ignore malformed declarations', () => {
    expect(parseInlineStyle('nonsense; color: red;;')).toEqual({
      color: 'red',
    });
  });

  it('should return an empty map for empty input', () => {
    expect(parseInlineStyle(undefined)).toEqual({});
    expect(parseInlineStyle('')).toEqual({});
  });

  it('should round-trip through serializeInlineStyle', () => {
    const style = 'background-color: #1961ed; border-radius: 6px;';

    expect(serializeInlineStyle(parseInlineStyle(style))).toBe(style);
  });
});
