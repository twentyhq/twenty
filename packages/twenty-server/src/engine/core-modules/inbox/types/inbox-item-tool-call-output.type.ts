// What a call left behind once it ran. Unlike the input this is not kept to
// scalars: it mirrors what the tool itself returned, and narrowing it further
// here would only drop what the person is being shown.
export type InboxItemToolCallOutput = {
  message?: string;
  result?: object;
  warnings?: string[];
};
