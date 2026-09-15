import { type InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';

// A field a tool call takes, declared by the producer rather than known to the
// engine, so the editor can draw it and the run can check it.
export type InboxItemFieldSchema = {
  key: string;
  label: string;
  type: InboxItemFieldType;
  isRequired?: boolean;
};
