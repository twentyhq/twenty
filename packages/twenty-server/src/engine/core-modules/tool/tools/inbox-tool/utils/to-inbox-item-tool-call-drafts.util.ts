import { type z } from 'zod';

import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';
import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';
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

// An agent describes a call by its input alone, so the field schema is read off
// the values and a producer that knows nothing about field types still gets an
// editable plan. A null is the agent saying it has no value, so the key is left
// out; a required key it left out is shown empty for the person to fill.
export const toInboxItemToolCallDrafts = (
  toolCalls: z.infer<typeof InboxItemToolCallDraftZodSchema>[],
): InboxItemToolCallDraft[] =>
  toolCalls.map((toolCall) => {
    const requiredKeys = toolCall.requiredInputKeys ?? [];
    const proposedInput: InboxItemToolCallInput = Object.fromEntries(
      Object.entries(toolCall.input).filter(([, value]) => value !== null),
    );
    const proposedKeys = Object.keys(proposedInput);
    const keys = [
      ...proposedKeys,
      ...new Set(requiredKeys.filter((key) => !proposedKeys.includes(key))),
    ];

    return {
      toolName: toolCall.toolName,
      label: toolCall.label,
      description: toolCall.description,
      icon: toolCall.icon,
      inputSchema: keys.map((key) => ({
        key,
        label: toFieldLabel(key),
        type: toFieldType(proposedInput[key]),
        ...(requiredKeys.includes(key) ? { isRequired: true } : {}),
      })),
      proposedInput,
    };
  });
