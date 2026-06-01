import { z } from 'zod';

import { sanitizeFilterWithSchema } from 'src/engine/core-modules/record-crud/utils/sanitize-filter-with-schema.util';

// Mirrors the relevant shape produced by generateRecordFilterSchema: text
// fields, a relation keyed with an `Id` suffix, a RICH_TEXT composite, and the
// recursive and/or/not logical operators.
const textOp = z
  .object({
    eq: z.string().optional(),
    neq: z.string().optional(),
    ilike: z.string().optional(),
  })
  .optional();
const relationOp = z
  .object({ eq: z.string().optional(), in: z.array(z.string()).optional() })
  .optional();

const filterSchema: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z.object({ firstName: textOp, lastName: textOp }).optional(),
      targetPersonId: relationOp,
      bodyV2: z.object({ markdown: textOp, blocknote: textOp }).optional(),
      title: textOp,
      or: z.array(filterSchema).optional(),
      and: z.array(filterSchema).optional(),
      not: filterSchema.optional(),
    })
    .partial(),
);

describe('sanitizeFilterWithSchema', () => {
  it('strips a bare operator placed at the object root', () => {
    expect(sanitizeFilterWithSchema(filterSchema, { ilike: 'Foreman' })).toEqual(
      {},
    );
  });

  it('strips an operator placed on a relation field (bare relation name)', () => {
    // `targetPerson` isn't a schema key (it is exposed as `targetPersonId`),
    // so the whole malformed branch is dropped.
    expect(
      sanitizeFilterWithSchema(filterSchema, {
        targetPerson: { ilike: '%uuid%' },
      }),
    ).toEqual({});
  });

  it('keeps a correctly-shaped relation filter', () => {
    expect(
      sanitizeFilterWithSchema(filterSchema, { targetPersonId: { eq: 'uuid' } }),
    ).toEqual({ targetPersonId: { eq: 'uuid' } });
  });

  it('keeps a valid composite (RICH_TEXT markdown) filter', () => {
    expect(
      sanitizeFilterWithSchema(filterSchema, {
        bodyV2: { markdown: { ilike: '%hello%' } },
      }),
    ).toEqual({ bodyV2: { markdown: { ilike: '%hello%' } } });
  });

  it('preserves a valid filter and strips invalid branches inside or/and/not', () => {
    expect(
      sanitizeFilterWithSchema(filterSchema, {
        or: [
          { name: { firstName: { ilike: 'Tom' }, lastName: { ilike: 'Foreman' } } },
          { targetPerson: { ilike: 'oops' } },
        ],
      }),
    ).toEqual({
      or: [
        { name: { firstName: { ilike: 'Tom' }, lastName: { ilike: 'Foreman' } } },
        {},
      ],
    });
  });

  it('returns the original filter unchanged when parsing throws', () => {
    const throwingSchema = {
      safeParse: () => ({ success: false }),
    } as unknown as z.ZodTypeAny;

    expect(
      sanitizeFilterWithSchema(throwingSchema, { anything: 1 }),
    ).toEqual({ anything: 1 });
  });
});
