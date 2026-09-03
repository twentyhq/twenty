// Structured context a type-specific renderer can read. Kept to scalars so it
// stays cheap to store, diff and interpolate into localized titles.
export type InboxItemPayload = Record<string, string | number | boolean | null>;
