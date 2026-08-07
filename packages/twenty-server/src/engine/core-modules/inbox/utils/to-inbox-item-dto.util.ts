import { isDefined } from 'twenty-shared/utils';

import {
  type InboxItemActionDTO,
  type InboxItemDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';

const toActionDto = (action: InboxItemAction): InboxItemActionDTO => ({
  key: action.key,
  label: action.label,
  icon: action.icon ?? null,
  isPrimary: action.isPrimary ?? false,
  handlerKind: action.handler.kind,
});

export const toInboxItemDto = (inboxItem: InboxItemEntity): InboxItemDTO => {
  const inboxItemType = inboxItem.inboxItemType as InboxItemTypeEntity;

  return {
    id: inboxItem.id,
    inboxItemType: {
      id: inboxItemType.id,
      key: inboxItemType.key,
      label: inboxItemType.label,
      icon: inboxItemType.icon,
      binding: inboxItemType.binding,
      actions: (isDefined(inboxItemType.actions)
        ? inboxItemType.actions
        : []
      ).map(toActionDto),
    },
    status: inboxItem.status,
    priority: inboxItem.priority,
    title: inboxItem.title,
    preview: inboxItem.preview,
    payload: inboxItem.payload,
    readAt: inboxItem.readAt,
    snoozedUntil: inboxItem.snoozedUntil,
    threadId: inboxItem.threadId,
    subjectObjectMetadataId: inboxItem.subjectObjectMetadataId,
    subjectRecordId: inboxItem.subjectRecordId,
    createdAt: inboxItem.createdAt,
    updatedAt: inboxItem.updatedAt,
  };
};
