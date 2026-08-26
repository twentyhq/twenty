import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

describe('stripSimpleQuotesFromString', () => {
  it('removes surrounding single quotes from a string', () => {
    const input = "'Hello, World!'";

    const output = stripSimpleQuotesFromString(input);

    expect(output).toBe('Hello, World!');
  });

  it.each([
    ['no simple quotes'],
    ["'only at start"],
    ["only at end'"],
    ["mid'dle"],
    [''],
  ])(
    'returns the input without changes if the string does not start and end with single quotes (%s)',
    (input) => {
      const output = stripSimpleQuotesFromString(input);

      expect(output).toBe(input);
    },
  );
});
