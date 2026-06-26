// Mirrors the core RICH_TEXT composite shape; only markdown is written from the
// app, blocknote is derived server-side on import.
export type CallRecordingSummary = {
  blocknote?: string | null;
  markdown: string | null;
};
