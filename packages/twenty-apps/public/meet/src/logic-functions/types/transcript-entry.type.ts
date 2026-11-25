export type TranscriptEntry = {
  participant: { name: string | null };
  words: Array<{
    text: string;
    start_timestamp: { relative: number };
  }>;
};
