import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { type MeetSmartNote } from 'src/logic-functions/types/meet-smart-note.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export const shouldGenerateMeetAiSummary = ({
  transcriptEntries,
  summaryMarkdown,
  smartNotes,
}: {
  transcriptEntries: TranscriptEntry[];
  summaryMarkdown: string | undefined;
  smartNotes: Pick<MeetSmartNote, 'state'>[];
}): boolean =>
  isNonEmptyArray(transcriptEntries) &&
  !isNonEmptyString(summaryMarkdown) &&
  smartNotes.every(({ state }) => state === 'FILE_GENERATED');
