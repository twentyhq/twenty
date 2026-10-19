import { SettingsPrivacyAiDataProcessing } from '@/settings/privacy/components/SettingsPrivacyAiDataProcessing';
import { SettingsPrivacyCompliance } from '@/settings/privacy/components/SettingsPrivacyCompliance';
import { SettingsPrivacyHero } from '@/settings/privacy/components/SettingsPrivacyHero';
import { SettingsPrivacySafeguards } from '@/settings/privacy/components/SettingsPrivacySafeguards';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';

// hosting, certifications and the DPA describe Twenty Cloud, so self-hosted instances only get the AI controls
export const SettingsPrivacy = () => {
  const isTwentyCloud = useIsTwentyCloud();
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();

  return (
    <>
      {isTwentyCloud && (
        <>
          <SettingsPrivacyHero />
          <SettingsPrivacyCompliance />
        </>
      )}
      {isAiDataPolicyConfigurable && <SettingsPrivacyAiDataProcessing />}
      {isTwentyCloud && <SettingsPrivacySafeguards />}
    </>
  );
};
