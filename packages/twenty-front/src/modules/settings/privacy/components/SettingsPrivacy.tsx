import { SettingsPrivacyAiDataProcessing } from '@/settings/privacy/components/SettingsPrivacyAiDataProcessing';
import { SettingsPrivacyCompliance } from '@/settings/privacy/components/SettingsPrivacyCompliance';
import { SettingsPrivacyHero } from '@/settings/privacy/components/SettingsPrivacyHero';
import { SettingsPrivacySafeguards } from '@/settings/privacy/components/SettingsPrivacySafeguards';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';
import { usePrivacyAudience } from '@/settings/privacy/hooks/usePrivacyAudience';

// hosting, certifications and the DPA describe Twenty Cloud, so self-hosted instances only get the AI controls
export const SettingsPrivacy = () => {
  const isTwentyCloud = useIsTwentyCloud();
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();
  const { privacyAudience, isPrivacyAudienceLoading } = usePrivacyAudience();

  const shouldShowCloudSections = isTwentyCloud && !isPrivacyAudienceLoading;

  return (
    <>
      {shouldShowCloudSections && (
        <>
          <SettingsPrivacyHero privacyAudience={privacyAudience} />
          <SettingsPrivacyCompliance privacyAudience={privacyAudience} />
        </>
      )}
      {isAiDataPolicyConfigurable && <SettingsPrivacyAiDataProcessing />}
      {shouldShowCloudSections && (
        <SettingsPrivacySafeguards privacyAudience={privacyAudience} />
      )}
    </>
  );
};
