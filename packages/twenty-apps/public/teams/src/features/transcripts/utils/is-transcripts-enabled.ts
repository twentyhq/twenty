import { FEATURE_FLAGS } from 'src/feature-flags/feature-flags';

export const isTranscriptsEnabled = (
  settingValue: string | undefined,
): boolean =>
  FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED && settingValue === 'true';
