// What a call runs with. Scalars cover most fields and keep the editor cheap,
// but real tools nest (an email takes recipients.to, a record write takes a
// composite field), so a value may also be an object or a list.
export type InboxItemToolCallInputValue =
  | string
  | number
  | boolean
  | null
  | object;

export type InboxItemToolCallInput = Record<
  string,
  InboxItemToolCallInputValue
>;
