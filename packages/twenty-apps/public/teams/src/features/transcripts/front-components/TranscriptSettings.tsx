import { useTranslate } from 'twenty-sdk/front-component';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TranscriptImportHistorySection } from 'src/features/transcripts/front-components/TranscriptImportHistorySection';
import { FeatureSettingsSection } from 'src/front-components/components/FeatureSettingsSection';
import { useFeatureSetting } from 'src/front-components/hooks/use-feature-setting';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const TranscriptSettings = () => {
  const { t } = useTranslate();
  const { settingValue, isSaving, hasSaveError, updateSetting } =
    useFeatureSetting({
      variableKey: TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY,
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
    });
  const isTranscriptImportEnabled = isFeatureEnabled({
    isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
    settingValue,
  });

  const handleChange = (isEnabled: boolean) => {
    void updateSetting(isEnabled);
  };

  return (
    <>
      <FeatureSettingsSection
        title={t('Transcripts')}
        label={t('Enable transcripts')}
        description={t(
          'Import Microsoft Teams meeting transcripts into this workspace.',
        )}
        isAvailable={FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED}
        isEnabled={isTranscriptImportEnabled}
        isSaving={isSaving}
        hasSaveError={hasSaveError}
        onChange={handleChange}
      />
      {isTranscriptImportEnabled && <TranscriptImportHistorySection />}
    </>
  );
};
