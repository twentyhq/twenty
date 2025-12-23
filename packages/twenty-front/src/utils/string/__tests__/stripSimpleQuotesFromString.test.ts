import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

describe('stripSimpleQuotesFromString', () => {
  it('removes surrounding single quotes from a string', () => {
    // Given
    const input = "'Hello, World!'";

    // When
    const output = stripSimpleQuotesFromString(input);

    // Then
    expect(output).toBe('Hello, World!');
  });

  it.each([
    // Given
    ['no simple quotes'],
    ["'only at start"],
    ["only at end'"],
    ["mid'dle"],
    [''],
  ])(
    'returns the input without changes if the string does not start and end with single quotes (%s)',
    (input) => {
      // When
      const output = stripSimpleQuotesFromString(input);

      // Then
      expect(output).toBe(input);
    },
  );
});
