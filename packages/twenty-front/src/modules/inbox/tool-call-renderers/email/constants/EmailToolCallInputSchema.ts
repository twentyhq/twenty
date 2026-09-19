import { type InboxItemField, InboxItemFieldType } from '~/generated/graphql';

// The schema a reply typed by hand is recorded with, the same one an agent's
// email proposal carries, so the run validates both alike.
export const EMAIL_TOOL_CALL_INPUT_SCHEMA: Omit<
  InboxItemField,
  '__typename'
>[] = [
  {
    key: 'recipients',
    label: 'Recipients',
    type: InboxItemFieldType.OBJECT,
    isRequired: true,
  },
  {
    key: 'subject',
    label: 'Subject',
    type: InboxItemFieldType.TEXT,
    isRequired: true,
  },
  {
    key: 'body',
    label: 'Body',
    type: InboxItemFieldType.LONG_TEXT,
    isRequired: true,
  },
];
