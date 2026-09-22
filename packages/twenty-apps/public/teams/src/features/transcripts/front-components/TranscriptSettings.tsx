import { useTranslate } from 'twenty-sdk/front-component';

import { FEATURE_FLAGS } from 'src/feature-flags/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
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

  const handleChange = (isEnabled: boolean) => {
    void updateSetting(isEnabled);
  };

  return (
    <FeatureSettingsSection
      title={t('Transcripts')}
      label={t('Enable transcripts')}
      description={t(
        'Import Microsoft Teams meeting transcripts into this workspace.',
      )}
      isAvailable={FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED}
      isEnabled={isFeatureEnabled({
        isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
        settingValue,
      })}
      isSaving={isSaving}
      hasSaveError={hasSaveError}
      onChange={handleChange}
    />
  );
};
