import { z } from 'zod';

export const NullCheckEnum = z
  .enum(['NULL', 'NOT_NULL'])
  .describe('Is null or not null');


export const TextFilterSchema = z
  .object({
    eq: z.string().optional().describe('Equals'),
    neq: z.string().optional().describe('Not equals'),
    in: z.array(z.string()).optional().describe('In array of values'),
    like: z
      .string()
      .optional()
      .describe('Case-sensitive pattern match (use % for wildcards)'),
    ilike: z
      .string()
      .optional()
      .describe('Case-insensitive pattern match (use % for wildcards)'),
    startsWith: z.string().optional().describe('Starts with'),
    endsWith: z.string().optional().describe('Ends with'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const NumberFilterSchema = z
  .object({
    eq: z.number().optional().describe('Equals'),
    neq: z.number().optional().describe('Not equals'),
    gt: z.number().optional().describe('Greater than'),
    gte: z.number().optional().describe('Greater than or equal'),
    lt: z.number().optional().describe('Less than'),
    lte: z.number().optional().describe('Less than or equal'),
    in: z.array(z.number()).optional().describe('In array of values'),
    is: NullCheckEnum.optional(),
  })
  .optional();

export const DateFilterSchema = z
  .object({
    eq: z
      .string()
      .datetime()
      .optional()
      .describe('Equals (ISO datetime string)'),
    neq: z
      .string()
      .datetime()
      .optional()
      .describe('Not equals (ISO datetime string)'),
    gt: z
      .string()
      .datetime()
      .optional()
      .describe('Greater than (ISO datetime string)'),
    gte: z
      .string()
      .datetime()
      .optional()
      .describe('Greater than or equal (ISO datetime string)'),
    lt: z
      .string()
      .datetime()
      .optional()
      .describe('Less than (ISO datetime string)'),
    lte: z
      .string()
      .datetime()
      .optional()
      .describe('Less than or equal (ISO datetime string)'),
    in: z
      .array(z.string().datetime())
      .optional()
      .describe('In array of values (ISO datetime strings)'),
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
    like: z.string().optional().describe('Case-sensitive pattern match'),
    ilike: z.string().optional().describe('Case-insensitive pattern match'),
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
        eq: z.string().url().optional().describe('Primary link URL equals'),
        neq: z
          .string()
          .url()
          .optional()
          .describe('Primary link URL not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const AddressFilterSchema = z
  .object({
    addressStreet1: z
      .object({
        eq: z.string().optional().describe('Street 1 equals'),
        neq: z.string().optional().describe('Street 1 not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    addressCity: z
      .object({
        eq: z.string().optional().describe('City equals'),
        neq: z.string().optional().describe('City not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    addressCountry: z
      .object({
        eq: z.string().optional().describe('Country equals'),
        neq: z.string().optional().describe('Country not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const FullNameFilterSchema = z
  .object({
    firstName: z
      .object({
        eq: z.string().optional().describe('First name equals'),
        neq: z.string().optional().describe('First name not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        startsWith: z.string().optional().describe('Starts with'),
        endsWith: z.string().optional().describe('Ends with'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    lastName: z
      .object({
        eq: z.string().optional().describe('Last name equals'),
        neq: z.string().optional().describe('Last name not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
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
        eq: z.string().email().optional().describe('Primary email equals'),
        neq: z.string().email().optional().describe('Primary email not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const PhonesFilterSchema = z
  .object({
    primaryPhoneNumber: z
      .object({
        eq: z.string().optional().describe('Primary phone number equals'),
        neq: z
          .string()
          .optional()
          .describe('Primary phone number not equals'),
        like: z
          .string()
          .optional()
          .describe('Case-sensitive pattern match (use % for wildcards)'),
        ilike: z
          .string()
          .optional()
          .describe('Case-insensitive pattern match (use % for wildcards)'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();

export const CurrencyFilterSchema = z
  .object({
    amountMicros: z
      .object({
        eq: z.number().optional().describe('Amount equals'),
        neq: z.number().optional().describe('Amount not equals'),
        gt: z.number().optional().describe('Amount greater than'),
        gte: z.number().optional().describe('Amount greater than or equal'),
        lt: z.number().optional().describe('Amount less than'),
        lte: z.number().optional().describe('Amount less than or equal'),
        in: z
          .array(z.number())
          .optional()
          .describe('Amount in array of values'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
    currencyCode: z
      .object({
        eq: z.string().optional().describe('Currency code equals'),
        neq: z.string().optional().describe('Currency code not equals'),
        in: z
          .array(z.string())
          .optional()
          .describe('Currency code in array of values'),
        is: NullCheckEnum.optional(),
      })
      .optional(),
  })
  .optional();
