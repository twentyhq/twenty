export type TranscriptWord = {
  text: string;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
};

export type TranscriptEntry = {
  speakerName: string;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  text: string;
  words: TranscriptWord[];
};
