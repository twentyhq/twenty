import { type ZodSafeParseError } from 'zod';

import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

describe('camelCaseStringSchema', () => {
  it('validates a camel case string', () => {
    const result = camelCaseStringSchema.safeParse('camelCaseString');
    expect(result.success).toBe(true);
  });

  it('fails for non-camel case strings', () => {
    const result = camelCaseStringSchema.safeParse('NotCamelCase');
    expect(result.success).toBe(false);
    expect((result as ZodSafeParseError<string>).error.issues).toEqual([
      {
        code: 'custom',
        message: 'String should be camel case',
        path: [],
      },
    ]);
  });
});
