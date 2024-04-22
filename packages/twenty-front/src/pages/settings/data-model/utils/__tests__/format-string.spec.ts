import { formatString } from '~/pages/settings/data-model/utils/format-string.util';

const VALID_STRING_PATTERN = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

describe('formatString', () => {
  it('leaves strings unchanged if only latin characters', () => {
    const input = 'testName';

    expect(formatString(input).match(VALID_STRING_PATTERN)?.length).toBe(1);
    expect(formatString(input)).toEqual(input);
  });

  it('leaves strings unchanged if only latin characters and digits', () => {
    const input = 'testName123';

    expect(formatString(input).match(VALID_STRING_PATTERN)?.length).toBe(1);
    expect(formatString(input)).toEqual(input);
  });

  it('format strings with non latin characters', () => {
    const input = 'בְרִבְרִ';
    const expected = 'bRibRi';

    expect(formatString(input).match(VALID_STRING_PATTERN)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);
  });

  it('format strings with mixed characters', () => {
    const input = 'aa2בְרִבְרִ';
    const expected = 'aa2BRibRi';

    expect(formatString(input).match(VALID_STRING_PATTERN)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);
  });
});
