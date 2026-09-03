import { type z } from 'zod';

import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';
import { type InboxItemToolCallDraftZodSchema } from 'src/engine/core-modules/tool/tools/inbox-tool/inbox-tool.schema';

const LONG_TEXT_THRESHOLD = 80;

const toFieldType = (value: unknown): InboxItemFieldSchema['type'] => {
  if (typeof value === 'number') {
    return 'NUMBER';
  }

  if (typeof value === 'boolean') {
    return 'BOOLEAN';
  }

  if (typeof value === 'string') {
    return value.includes('\n') || value.length > LONG_TEXT_THRESHOLD
      ? 'LONG_TEXT'
      : 'TEXT';
  }

  return 'TEXT';
};

const toFieldLabel = (key: string): string => {
  const words = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

// An agent describes a call by its input alone; the editor needs a field per
// key to draw it. The schema is read off the values, so a producer that knows
// nothing about field types still gets an editable plan.
export const toInboxItemToolCallDrafts = (
  toolCalls: z.infer<typeof InboxItemToolCallDraftZodSchema>[],
): InboxItemToolCallDraft[] =>
  toolCalls.map((toolCall) => ({
    toolName: toolCall.toolName,
    label: toolCall.label,
    description: toolCall.description,
    icon: toolCall.icon,
    inputSchema: Object.entries(toolCall.input).map(([key, value]) => ({
      key,
      label: toFieldLabel(key),
      type: toFieldType(value),
    })),
    proposedInput: toolCall.input,
  }));
