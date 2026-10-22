import { useTranslate } from 'twenty-sdk/front-component';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcript-summary-enabled-application-variable-key';
import { TranscriptImportHistorySection } from 'src/features/transcripts/front-components/TranscriptImportHistorySection';
import { FeatureSettingsSection } from 'src/front-components/components/FeatureSettingsSection';
import { useFeatureSetting } from 'src/front-components/hooks/use-feature-setting';

export const TranscriptSettings = () => {
  const { t } = useTranslate();
  const { settingValue, isSaving, hasSaveError, updateSetting } =
    useFeatureSetting({
      variableKey: TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY,
      isAvailable: true,
    });

  const handleChange = (isEnabled: boolean) => {
    void updateSetting(isEnabled);
  };

  return (
    <>
      <FeatureSettingsSection
        title={t('Transcripts')}
        label={t('Enable transcript summaries')}
        description={t(
          'Write an AI summary on each Call Recording imported from Microsoft Teams. Each summary uses AI credits.',
        )}
        isAvailable
        isEnabled={settingValue === 'true'}
        isSaving={isSaving}
        hasSaveError={hasSaveError}
        onChange={handleChange}
      />
      {RELEASE_FLAGS.IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED && (
        <TranscriptImportHistorySection />
      )}
    </>
  );
};
