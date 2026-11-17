const TRANSCRIPT_NAME_PATTERN =
  /^(conferenceRecords\/[^/]+)\/transcripts\/[^/]+$/;

export const getConferenceRecordNameFromTranscriptName = (
  transcriptName: string,
): string | undefined => TRANSCRIPT_NAME_PATTERN.exec(transcriptName)?.[1];
