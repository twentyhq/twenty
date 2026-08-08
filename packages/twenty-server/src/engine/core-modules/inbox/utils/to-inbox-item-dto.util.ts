import { isDefined } from 'twenty-shared/utils';

import {
  type InboxItemActionDTO,
  type InboxItemDTO,
  type InboxItemFieldDTO,
  type InboxItemOutcomeDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import {
  type InboxItemFieldSchema,
  type InboxItemOutcome,
} from 'src/engine/core-modules/inbox/types/inbox-item-resolution.type';
import {
  getInboxItemScope,
  isInboxItemUnread,
} from 'src/engine/core-modules/inbox/utils/inbox-item-scope.util';

const toFieldDto = (field: InboxItemFieldSchema): InboxItemFieldDTO => ({
  key: field.key,
  label: field.label,
  type: field.type,
  isRequired: field.isRequired ?? false,
});

const toOutcomeDto = (outcome: InboxItemOutcome): InboxItemOutcomeDTO => ({
  key: outcome.key,
  label: outcome.label,
});

const toActionDto = (action: InboxItemAction): InboxItemActionDTO => ({
  key: action.key,
  label: action.label,
  icon: action.icon ?? null,
  isPrimary: action.isPrimary ?? false,
  navigationKind: action.navigation?.kind ?? null,
  transitionKind: action.transition?.kind ?? null,
  inputSchema: (action.inputSchema ?? []).map(toFieldDto),
});

// Requires the type relation to be loaded, so a caller that forgot the join
// fails at compile time rather than at render time.
export type InboxItemWithType = Omit<InboxItemEntity, 'inboxItemType'> & {
  inboxItemType: InboxItemTypeEntity;
};

// `now` comes from the request rather than from here, so every item in one
// response is placed against the same instant as the query that selected it.
export const toInboxItemDto = (
  inboxItem: InboxItemWithType,
  now: Date,
): InboxItemDTO => {
  const inboxItemType = inboxItem.inboxItemType;

  return {
    id: inboxItem.id,
    inboxItemType: {
      id: inboxItemType.id,
      key: inboxItemType.key,
      label: inboxItemType.label,
      icon: inboxItemType.icon,
      actions: (isDefined(inboxItemType.actions)
        ? inboxItemType.actions
        : []
      ).map(toActionDto),
      outcomes: (inboxItemType.resolution?.outcomes ?? []).map(toOutcomeDto),
    },
    scope: getInboxItemScope(inboxItem, now),
    isUnread: isInboxItemUnread(inboxItem),
    priority: inboxItem.priority,
    version: inboxItem.version,
    title: inboxItem.title,
    preview: inboxItem.preview,
    payload: inboxItem.payload,
    outcome: inboxItem.outcome,
    result: inboxItem.result,
    lastEventAt: inboxItem.lastEventAt,
    threadId: inboxItem.threadId,
    subjectObjectMetadataId: inboxItem.subjectObjectMetadataId,
    subjectRecordId: inboxItem.subjectRecordId,
  };
};
