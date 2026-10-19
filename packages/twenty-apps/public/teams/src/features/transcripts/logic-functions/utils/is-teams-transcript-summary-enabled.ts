import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

// TODO(@ehconitin): gate on a workspace summary setting once Teams has settings; V1 summarizes every imported transcript
export const isTeamsTranscriptSummaryEnabled = (): boolean =>
  isFeatureEnabled({
    isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
    settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
  });
