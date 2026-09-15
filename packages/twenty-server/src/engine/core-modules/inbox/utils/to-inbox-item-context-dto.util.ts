import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type InboxItemContextDTO,
  type InboxItemContextEdgeDTO,
  type InboxItemContextEntityDTO,
  InboxItemContextEntityKind,
  type InboxItemContextSourceDTO,
  InboxItemContextSourceKind,
} from 'src/engine/core-modules/inbox/dtos/inbox-item-context.dto';

const toEnumMember = <TEnum extends Record<string, string>>(
  enumType: TEnum,
  value: unknown,
): TEnum[keyof TEnum] | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const member = value.toUpperCase();

  return Object.values(enumType).includes(member)
    ? (member as TEnum[keyof TEnum])
    : undefined;
};

const toOptionalString = (value: unknown): string | null =>
  isNonEmptyString(value) ? value : null;

const toSource = (value: unknown): InboxItemContextSourceDTO | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const kind = toEnumMember(InboxItemContextSourceKind, value.kind);

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

const toEntities = (value: unknown): InboxItemContextEntityDTO[] =>
  Array.isArray(value)
    ? value.flatMap((item) =>
        isPlainObject(item) &&
        isNonEmptyString(item.key) &&
        isNonEmptyString(item.label)
          ? [
              {
                key: item.key,
                label: item.label,
                subtitle: toOptionalString(item.subtitle),
                kind:
                  toEnumMember(InboxItemContextEntityKind, item.kind) ??
                  InboxItemContextEntityKind.OTHER,
                recordId: toOptionalString(item.recordId),
                objectMetadataId: toOptionalString(item.objectMetadataId),
              },
            ]
          : [],
      )
    : [];

const toEdges = (value: unknown): InboxItemContextEdgeDTO[] =>
  Array.isArray(value)
    ? value.flatMap((item) =>
        isPlainObject(item) &&
        isNonEmptyString(item.from) &&
        isNonEmptyString(item.to) &&
        typeof item.label === 'string'
          ? [{ from: item.from, to: item.to, label: item.label }]
          : [],
      )
    : [];

// Producers write this column with no schema behind them, so every nested
// shape is checked here rather than trusted. A field that does not hold up is
// dropped, which is why nothing in the returned type is a lie.
export const toInboxItemContextDto = (
  context: unknown,
): InboxItemContextDTO => {
  if (!isPlainObject(context)) {
    return { summary: null, source: null, entities: [], edges: [] };
  }

  return {
    summary: toOptionalString(context.summary),
    source: toSource(context.source),
    entities: toEntities(context.entities),
    edges: toEdges(context.edges),
  };
};
