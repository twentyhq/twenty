import { TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcript-summary-enabled-application-variable-key';
import { isTeamsTranscriptImportEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-import-enabled';

export const isTeamsTranscriptSummaryEnabled = (): boolean =>
  isTeamsTranscriptImportEnabled() &&
  process.env[TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY] === 'true';
