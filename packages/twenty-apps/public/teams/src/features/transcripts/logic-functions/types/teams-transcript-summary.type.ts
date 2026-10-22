export type TeamsTranscriptSummary =
  | { outcome: 'summarized'; markdown: string }
  | { outcome: 'not-summarizable'; reason: string };
