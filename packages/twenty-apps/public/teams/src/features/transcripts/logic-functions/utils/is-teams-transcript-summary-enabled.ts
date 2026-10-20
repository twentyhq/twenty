import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcript-summary-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const isTeamsTranscriptSummaryEnabled = (): boolean =>
  isFeatureEnabled({
    isAvailable: RELEASE_FLAGS.IS_TRANSCRIPT_IMPORT_RELEASED,
    settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
  }) &&
  isFeatureEnabled({
    isAvailable: RELEASE_FLAGS.IS_TRANSCRIPT_IMPORT_RELEASED,
    settingValue:
      process.env[TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY],
  });
