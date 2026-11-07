import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';

export const isTeamsTranscriptImportEnabled = (): boolean =>
  process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] === 'true';
