import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const hasCallRecordingTranscriptSpeakerNames = (
  entries: CallRecordingParsedTranscriptEntry[],
): boolean => entries.some((entry) => isDefined(entry.speakerName));
