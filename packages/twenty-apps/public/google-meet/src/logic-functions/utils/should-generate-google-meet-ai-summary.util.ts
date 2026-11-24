import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { type GoogleMeetSmartNote } from 'src/logic-functions/types/google-meet-smart-note.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export const shouldGenerateGoogleMeetAiSummary = ({
  transcriptEntries,
  summaryMarkdown,
  smartNotes,
}: {
  transcriptEntries: TranscriptEntry[];
  summaryMarkdown: string | undefined;
  smartNotes: Pick<GoogleMeetSmartNote, 'state'>[];
}): boolean =>
  isNonEmptyArray(transcriptEntries) &&
  !isNonEmptyString(summaryMarkdown) &&
  smartNotes.every(({ state }) => state === 'FILE_GENERATED');
