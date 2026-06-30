import { z } from 'zod';

export const NullCheckEnum = z
  .enum(['NULL', 'NOT_NULL'])
  .describe('Is null or not null');

export const TextFilterSchema = z
  .object({
    eq: z.string().optional().describe('Equals'),
    neq: z.string().optional().describe('Not equals'),
    in: z.array(z.string()).optional().describe('In array'),
    like: z.string().optional().describe('LIKE (% wildcard)'),
    ilike: z
      .string()
      .optional()
      .describe('ILIKE (% wildcard, case-insensitive)'),
    startsWith: z.string().optional().describe('Starts with'),
    endsWith: z.string().optional().describe('Ends with'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const NumberFilterSchema = z
  .object({
    eq: z.number().optional().describe('Equals'),
    neq: z.number().optional().describe('Not equals'),
    gt: z.number().optional().describe('>'),
    gte: z.number().optional().describe('>='),
    lt: z.number().optional().describe('<'),
    lte: z.number().optional().describe('<='),
    in: z.array(z.number()).optional().describe('In array'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const DateFilterSchema = z
  .object({
    eq: z.string().datetime().optional().describe('Equals (ISO datetime)'),
    neq: z.string().datetime().optional().describe('Not equals (ISO datetime)'),
    gt: z.string().datetime().optional().describe('> ISO datetime'),
    gte: z.string().datetime().optional().describe('>= ISO datetime'),
    lt: z.string().datetime().optional().describe('< ISO datetime'),
    lte: z.string().datetime().optional().describe('<= ISO datetime'),
    in: z
      .array(z.string().datetime())
      .optional()
      .describe('In array (ISO datetimes)'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const BooleanFilterSchema = z
  .object({
    eq: z.boolean().optional().describe('Equals'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const UuidFilterSchema = z
  .object({
    eq: z.string().uuid().optional().describe('Equals'),
    neq: z.string().uuid().optional().describe('Not equals'),
    in: z.array(z.string().uuid()).optional().describe('In array of values'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const DefaultFilterSchema = z
  .object({
    eq: z.string().optional().describe('Equals'),
    neq: z.string().optional().describe('Not equals'),
    like: z.string().optional().describe('LIKE (% wildcard)'),
    ilike: z
      .string()
      .optional()
      .describe('ILIKE (% wildcard, case-insensitive)'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const ArrayFieldFilterSchema = z
  .object({
    containsIlike: z
      .string()
      .optional()
      .describe('Contains case-insensitive substring'),
    is: NullCheckEnum.optional(),
    isEmptyArray: z.boolean().optional().describe('Is empty array'),
  })
  .optional();

// Composite filter schemas — A1.3
// Each is a shared constant so all LINKS/ADDRESS/etc. fields share one $def.

export const LinksFilterSchema = z
  .object({
    primaryLinkUrl: z
      .object({
        eq: z.string().url().optional().describe('Equals'),
        neq: z.string().url().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const AddressFilterSchema = z
  .object({
    addressStreet1: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    addressCity: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    addressCountry: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const FullNameFilterSchema = z
  .object({
    firstName: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        startsWith: z.string().optional().describe('Starts with'),
        endsWith: z.string().optional().describe('Ends with'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    lastName: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        startsWith: z.string().optional().describe('Starts with'),
        endsWith: z.string().optional().describe('Ends with'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const EmailsFilterSchema = z
  .object({
    primaryEmail: z
      .object({
        eq: z.string().email().optional().describe('Equals'),
        neq: z.string().email().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const PhonesFilterSchema = z
  .object({
    primaryPhoneNumber: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const RichTextFilterSchema = z
  .object({
    markdown: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        like: z.string().optional().describe('LIKE (% wildcard)'),
        ilike: z
          .string()
          .optional()
          .describe('ILIKE (% wildcard, case-insensitive)'),
        startsWith: z.string().optional().describe('Starts with'),
        endsWith: z.string().optional().describe('Ends with'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const CurrencyFilterSchema = z
  .object({
    amountMicros: z
      .object({
        eq: z.number().optional().describe('Equals'),
        neq: z.number().optional().describe('Not equals'),
        gt: z.number().optional().describe('>'),
        gte: z.number().optional().describe('>='),
        lt: z.number().optional().describe('<'),
        lte: z.number().optional().describe('<='),
        in: z.array(z.number()).optional().describe('In array'),
        is: NullCheckEnum.optional(),
      })
      .describe(
        'Currency amount in micros (1 unit = 1,000,000 micros). Multiply the user-provided amount by 1,000,000 to build this filter.',
      )
      .optional(),
    currencyCode: z
      .object({
        eq: z.string().optional().describe('Equals'),
        neq: z.string().optional().describe('Not equals'),
        in: z.array(z.string()).optional().describe('In array'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();
