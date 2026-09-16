import {
  type InboxItemDTO,
  type InboxItemFieldDTO,
  type InboxItemToolCallDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { type InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { type InboxItemRecordEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-record.entity';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { toInboxItemContextDto } from 'src/engine/core-modules/inbox/utils/to-inbox-item-context-dto.util';
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

// Tool calls and records are optional: a producer's freshly inserted row has
// none to show.
export type InboxItemWithPlan = Omit<
  InboxItemEntity,
  'toolCalls' | 'records'
> & {
  toolCalls?: InboxItemToolCallEntity[];
  records?: InboxItemRecordEntity[];
};

// `now` comes from the request rather than from here, so every item in one
// response is placed against the same instant as the query that selected it.
export const toInboxItemDto = (
  inboxItem: InboxItemWithPlan,
  now: Date,
  actorUserWorkspaceId: string,
): InboxItemDTO => {
  return {
    id: inboxItem.id,
    icon: inboxItem.icon,
    scope: getInboxItemScope(inboxItem, now),
    isUnread: isInboxItemUnread(inboxItem),
    priority: inboxItem.priority,
    version: inboxItem.version,
    title: inboxItem.title,
    summary: inboxItem.summary,
    context: toInboxItemContextDto(inboxItem.context),
    records: [...(inboxItem.records ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((record) => ({
        id: record.id,
        position: record.position,
        label: record.label,
        subtitle: record.subtitle,
        relationLabel: record.relationLabel,
        objectMetadataId: record.objectMetadataId,
        recordId: record.recordId,
      })),
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
