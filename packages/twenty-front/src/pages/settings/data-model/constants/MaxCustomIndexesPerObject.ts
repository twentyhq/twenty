// Mirrors MAX_CUSTOM_INDEXES_PER_OBJECT on the server. Kept in sync manually —
// the server is the source of truth and will reject anything above the cap;
// this constant just lets the UI disable the button preemptively.
export const MAX_CUSTOM_INDEXES_PER_OBJECT = 10;
