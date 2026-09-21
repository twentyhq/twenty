export type TranscriptEntry = {
  participant: { name: string };
  words: Array<{
    text: string;
    start_timestamp?: { relative: number };
  }>;
};
