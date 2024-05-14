import { SafeParseError } from 'zod';

import { simpleQuotesStringSchema } from '../simpleQuotesStringSchema';

describe('simpleQuotesStringSchema', () => {
  it('validates a string with simple quotes', () => {
    // Given
    const input = "'with simple quotes'";

    // When
    const result = simpleQuotesStringSchema.parse(input);

    // Then
    expect(result).toBe(input);
  });

  it.each([
    // Given
    ['no simple quotes'],
    ["'only at start"],
    ["only at end'"],
    ["mid'dle"],
    [''],
  ])('fails for strings not wrapped in simple quotes (%s)', (input) => {
    // When
    const result = simpleQuotesStringSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
    expect((result as SafeParseError<string>).error.errors).toEqual([
      {
        code: 'custom',
        message: 'String should be wrapped in simple quotes',
        path: [],
      },
    ]);
  });
});
