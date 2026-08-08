import { isDefined } from 'twenty-shared/utils';

import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
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
  input: unknown,
): InboxItemPayload | undefined => {
  if (!isDefined(input)) {
    return undefined;
  }

  // The GraphQL scalar accepts any JSON, so a list or a bare string reaches
  // here typed as a record and would otherwise become {"0": ...}
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new InboxException(
      'Expected an object of field values',
      InboxExceptionCode.INVALID_INBOX_ACTION,
    );
  }

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => isScalar(value)),
  ) as InboxItemPayload;
};
