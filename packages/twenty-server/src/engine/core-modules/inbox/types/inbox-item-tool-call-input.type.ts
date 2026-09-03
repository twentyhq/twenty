// What a call runs with. Kept to scalars so it stays cheap to store, diff and
// show in an editor.
export type InboxItemToolCallInput = Record<
  string,
  string | number | boolean | null
>;
