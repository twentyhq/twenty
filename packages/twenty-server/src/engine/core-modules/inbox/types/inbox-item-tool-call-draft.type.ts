import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';

// One call a producer proposes as part of an item, before it has a row.
export type InboxItemToolCallDraft = {
  toolName: string;
  label: string;
  description?: string;
  icon?: string;
  inputSchema?: InboxItemFieldSchema[];
  proposedInput: InboxItemToolCallInput;
};
