// A field an outcome carries, declared by the type rather than known to the
// engine. "answer", "feedback", "reason" are all just declared fields.
export type InboxItemFieldSchema = {
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'BOOLEAN';
  isRequired?: boolean;
};

export type InboxItemOutcome = {
  key: string;
  label: string;
};

// The set of ways an item of this type can end. An approval declares
// APPROVED / CHANGES_REQUESTED / REJECTED, a question declares ANSWERED. The
// engine knows none of those words.
export type InboxItemResolution = {
  outcomes: InboxItemOutcome[];
};
