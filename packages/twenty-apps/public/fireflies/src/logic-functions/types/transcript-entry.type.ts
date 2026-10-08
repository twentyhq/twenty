import { type TranscriptEntryWord } from 'src/logic-functions/types/transcript-entry-word.type';

export type TranscriptEntry = {
  participant: { name: string };
  words: TranscriptEntryWord[];
};
