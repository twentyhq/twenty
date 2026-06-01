import { type z } from 'zod';

/**
 * Validates a model-supplied filter against the record filter zod schema and
 * returns the parsed (sanitised) filter. Unknown keys and invalid operator
 * shapes are stripped recursively — covering bare operators at the object root
 * (`{ ilike: ... }`), invalid operators nested in a relation/composite value
 * (`{ targetPerson: { ilike: ... } }`), and the same inside `and`/`or`/`not`.
 *
 * The AI find tool only uses this schema to generate the JSON schema shown to
 * the model; the executor maps the raw args straight to a filter without
 * re-validating, so a malformed filter would otherwise reach the query runner
 * and throw `Object <x> doesn't have any "ilike" field`.
 *
 * On a parse failure the original filter is returned unchanged, preserving
 * prior behaviour rather than risking a silently wrong query.
 */
export const sanitizeFilterWithSchema = (
  filterSchema: z.ZodTypeAny,
  rawFilter: unknown,
): Record<string, unknown> => {
  const result = filterSchema.safeParse(rawFilter ?? {});

  if (result.success) {
    return result.data as Record<string, unknown>;
  }

  return (rawFilter ?? {}) as Record<string, unknown>;
};
