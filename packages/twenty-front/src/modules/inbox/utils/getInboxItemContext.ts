import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  type InboxItemContext,
  type InboxItemContextEdge,
  type InboxItemContextEntity,
  type InboxItemContextSource,
} from '@/inbox/types/InboxItemContext';
import { type InboxItem } from '~/generated/graphql';

const SOURCE_KINDS: InboxItemContextSource['kind'][] = [
  'email',
  'thread',
  'record',
  'call',
];

const ENTITY_KINDS: InboxItemContextEntity['kind'][] = [
  'person',
  'company',
  'opportunity',
  'other',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf = <TValue extends string>(
  values: TValue[],
  value: unknown,
): value is TValue => isString(value) && values.some((item) => item === value);

const optionalString = (value: unknown) =>
  isNonEmptyString(value) ? value : undefined;

const toSource = (value: unknown): InboxItemContextSource | undefined => {
  if (
    !isRecord(value) ||
    !isOneOf(SOURCE_KINDS, value.kind) ||
    !isNonEmptyString(value.label)
  ) {
    return undefined;
  }

  return {
    kind: value.kind,
    label: value.label,
    detail: optionalString(value.detail),
    excerpt: optionalString(value.excerpt),
    messageCount: isNumber(value.messageCount) ? value.messageCount : undefined,
  };
};

const toEntities = (value: unknown): InboxItemContextEntity[] =>
  Array.isArray(value)
    ? value.flatMap((item) =>
        isRecord(item) &&
        isNonEmptyString(item.key) &&
        isNonEmptyString(item.label)
          ? [
              {
                key: item.key,
                label: item.label,
                subtitle: optionalString(item.subtitle),
                kind: isOneOf(ENTITY_KINDS, item.kind) ? item.kind : 'other',
                recordId: optionalString(item.recordId),
                objectMetadataId: optionalString(item.objectMetadataId),
              },
            ]
          : [],
      )
    : [];

const toEdges = (value: unknown): InboxItemContextEdge[] =>
  Array.isArray(value)
    ? value.flatMap((item) =>
        isRecord(item) &&
        isNonEmptyString(item.from) &&
        isNonEmptyString(item.to) &&
        isString(item.label)
          ? [{ from: item.from, to: item.to, label: item.label }]
          : [],
      )
    : [];

// The context travels as JSON written by a producer the page does not
// control, so every nested shape is checked here rather than trusted.
export const getInboxItemContext = (
  inboxItem: Pick<InboxItem, 'context'>,
): InboxItemContext => {
  const context: unknown = inboxItem.context;

  if (!isRecord(context)) {
    return { entities: [], edges: [] };
  }

  const source = toSource(context.source);

  return {
    summary: optionalString(context.summary),
    ...(isDefined(source) ? { source } : {}),
    entities: toEntities(context.entities),
    edges: toEdges(context.edges),
  };
};
