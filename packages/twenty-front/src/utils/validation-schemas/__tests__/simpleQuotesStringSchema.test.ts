import { SafeParseError } from 'zod';

import { simpleQuotesStringSchema } from '../simpleQuotesStringSchema';

describe('simpleQuotesStringSchema', () => {
  it('validates a string with simple quotes', () => {
    const result = simpleQuotesStringSchema.safeParse("'with simple quotes'");
    expect(result.success).toBe(true);
  });

  it.each([
    ['no simple quotes'],
    ["'only at start"],
    ["only at end'"],
    ["mid'dle"],
    [''],
  ])('fails for strings not wrapped in simple quotes (%s)', (value) => {
    const result = simpleQuotesStringSchema.safeParse(value);

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
