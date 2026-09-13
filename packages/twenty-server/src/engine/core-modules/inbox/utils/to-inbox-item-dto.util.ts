import {
  type InboxItemDTO,
  type InboxItemFieldDTO,
  type InboxItemToolCallDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { type InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
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

export const toInboxItemToolCallDto = (
  toolCall: InboxItemToolCallEntity,
): InboxItemToolCallDTO => ({
  id: toolCall.id,
  position: toolCall.position,
  toolName: toolCall.toolName,
  label: toolCall.label,
  description: toolCall.description,
  icon: toolCall.icon,
  status: toolCall.status,
  inputSchema: (toolCall.inputSchema ?? []).map(toFieldDto),
  proposedInput: toolCall.proposedInput ?? {},
  editedInput: toolCall.editedInput,
  output: toolCall.output,
  error: toolCall.error,
});

// Requires the type relation to be loaded, so a caller that forgot the join
// fails at compile time rather than at render time. Tool calls are optional:
// a producer's freshly inserted row has none to show.
export type InboxItemWithType = Omit<
  InboxItemEntity,
  'inboxItemType' | 'toolCalls'
> & {
  inboxItemType: InboxItemTypeEntity;
  toolCalls?: InboxItemToolCallEntity[];
};

// `now` comes from the request rather than from here, so every item in one
// response is placed against the same instant as the query that selected it.
export const toInboxItemDto = (
  inboxItem: InboxItemWithType,
  now: Date,
  actorUserWorkspaceId: string,
): InboxItemDTO => {
  const inboxItemType = inboxItem.inboxItemType;

  return {
    id: inboxItem.id,
    inboxItemType: {
      id: inboxItemType.id,
      key: inboxItemType.key,
      label: inboxItemType.label,
      icon: inboxItemType.icon,
    },
    scope: getInboxItemScope(inboxItem, now),
    isUnread: isInboxItemUnread(inboxItem),
    priority: inboxItem.priority,
    version: inboxItem.version,
    title: inboxItem.title,
    context: inboxItem.context,
    toolCalls: [...(inboxItem.toolCalls ?? [])]
      .sort((left, right) => left.position - right.position)
      .map(toInboxItemToolCallDto),
    outcome: inboxItem.outcome,
    lastEventAt: inboxItem.lastEventAt,
    queueId: inboxItem.queueId,
    assigneeUserWorkspaceId: inboxItem.assigneeUserWorkspaceId,
    isAssignedToMe: inboxItem.assigneeUserWorkspaceId === actorUserWorkspaceId,
    threadId: inboxItem.threadId,
    subjectObjectMetadataId: inboxItem.subjectObjectMetadataId,
    subjectRecordId: inboxItem.subjectRecordId,
  };
};
