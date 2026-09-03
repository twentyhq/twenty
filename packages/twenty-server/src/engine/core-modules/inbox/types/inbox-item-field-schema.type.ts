// A field a tool call takes, declared by the producer rather than known to the
// engine, so the editor can draw it and the run can check it.
export type InboxItemFieldSchema = {
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'BOOLEAN';
  isRequired?: boolean;
};
