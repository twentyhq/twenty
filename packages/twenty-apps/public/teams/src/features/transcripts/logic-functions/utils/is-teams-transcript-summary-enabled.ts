import { TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcript-summary-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';

export const isTeamsTranscriptSummaryEnabled = (): boolean =>
  process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] === 'true' &&
  process.env[TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY] === 'true';
