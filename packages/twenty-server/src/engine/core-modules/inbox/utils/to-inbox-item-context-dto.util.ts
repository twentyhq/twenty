import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type InboxItemContextDTO,
  type InboxItemContextSourceDTO,
  InboxItemContextSourceKind,
} from 'src/engine/core-modules/inbox/dtos/inbox-item-context.dto';
import { INBOX_ITEM_CONTEXT_VERSION } from 'src/engine/core-modules/inbox/types/inbox-item-context.type';

const UNKNOWN_PRODUCER = 'unknown';

const toOptionalString = (value: unknown): string | null =>
  isNonEmptyString(value) ? value : null;

const toSourceKind = (
  value: unknown,
): InboxItemContextSourceKind | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const kind = value.toUpperCase();

  return Object.values(InboxItemContextSourceKind).includes(
    kind as InboxItemContextSourceKind,
  )
    ? (kind as InboxItemContextSourceKind)
    : undefined;
};

const toSource = (value: unknown): InboxItemContextSourceDTO | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const kind = toSourceKind(value.kind);

  if (!isDefined(kind) || !isNonEmptyString(value.label)) {
    return null;
  }

  return {
    kind,
    label: value.label,
    detail: toOptionalString(value.detail),
    excerpt: toOptionalString(value.excerpt),
    messageCount:
      typeof value.messageCount === 'number' ? value.messageCount : null,
  };
};

// A row written before this shape existed has no version and no producer, so
// it reads as version 0 from an unknown producer rather than as a lie.
export const toInboxItemContextDto = (
  context: unknown,
): InboxItemContextDTO => {
  if (!isPlainObject(context)) {
    return { version: 0, producer: UNKNOWN_PRODUCER, source: null };
  }

  return {
    version:
      typeof context.version === 'number'
        ? context.version
        : isDefined(context.producer)
          ? INBOX_ITEM_CONTEXT_VERSION
          : 0,
    producer: toOptionalString(context.producer) ?? UNKNOWN_PRODUCER,
    source: toSource(context.source),
  };
};
