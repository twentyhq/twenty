import { type z } from 'zod';

import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';
import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';
import { type InboxItemToolCallDraftZodSchema } from 'src/engine/core-modules/tool/tools/inbox-tool/inbox-tool.schema';

const LONG_TEXT_THRESHOLD = 80;

const toFieldType = (value: unknown): InboxItemFieldType => {
  if (typeof value === 'number') {
    return InboxItemFieldType.NUMBER;
  }

  if (typeof value === 'boolean') {
    return InboxItemFieldType.BOOLEAN;
  }

  if (typeof value === 'object') {
    return InboxItemFieldType.OBJECT;
  }

  if (typeof value === 'string') {
    return value.includes('\n') || value.length > LONG_TEXT_THRESHOLD
      ? InboxItemFieldType.LONG_TEXT
      : InboxItemFieldType.TEXT;
  }

  return InboxItemFieldType.TEXT;
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
// out; a required key it left out is shown empty for the person to fill, typed
// from inputFieldTypes since there is no value to read it off.
export const toInboxItemToolCallDrafts = (
  toolCalls: z.infer<typeof InboxItemToolCallDraftZodSchema>[],
): InboxItemToolCallDraft[] =>
  toolCalls.map((toolCall) => {
    const requiredKeys = toolCall.requiredInputKeys ?? [];
    const proposedInput = Object.fromEntries(
      Object.entries(toolCall.input).filter(([, value]) => value !== null),
    ) as InboxItemToolCallInput;
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
        type: proposedKeys.includes(key)
          ? toFieldType(proposedInput[key])
          : (toolCall.inputFieldTypes?.[key] ?? InboxItemFieldType.TEXT),
        ...(requiredKeys.includes(key) ? { isRequired: true } : {}),
      })),
      proposedInput,
    };
  });
