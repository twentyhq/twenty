import type { z } from 'zod';

import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

// The header inbound webhooks carry the shared secret in. Logic-functions must
// forward this exact header (forwardedRequestHeaders) for the guard to see it.
export const APPLICATION_SECRET_HEADER = 'x-application-secret';
type GuardedEvent = { headers?: Record<string, string | undefined>; body?: unknown };

export function readSecretGuardedEvent<TSchema extends z.ZodTypeAny>(
  event: unknown,
  schema: TSchema,
): { ok: true; input: z.infer<TSchema> } | { ok: false; reason: 'unauthorized' | 'invalid_input' } {
  const isEvent = typeof event === 'object' && event !== null && ('body' in event || 'headers' in event);
  const headers = isEvent ? (event as GuardedEvent).headers ?? {} : {};
  const raw = isEvent ? (event as GuardedEvent).body : event;
  const expected = process.env.PARTNER_APPLICATION_SECRET;
  if (!isNonEmptyString(expected) || headers[APPLICATION_SECRET_HEADER] !== expected) return { ok: false, reason: 'unauthorized' };
  const parsed = schema.safeParse(raw);
  return parsed.success ? { ok: true, input: parsed.data } : { ok: false, reason: 'invalid_input' };
}
