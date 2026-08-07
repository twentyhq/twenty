import { isDefined } from 'twenty-shared/utils';

import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';

const isScalar = (value: unknown): value is string | number | boolean | null =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

// Client supplied JSON is narrowed rather than cast: anything that is not a
// scalar is dropped, so a nested object cannot reach a jsonb column typed as
// a flat record.
export const toInboxItemPayload = (
  input: Record<string, unknown> | undefined,
): InboxItemPayload | undefined => {
  if (!isDefined(input)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => isScalar(value)),
  ) as InboxItemPayload;
};
