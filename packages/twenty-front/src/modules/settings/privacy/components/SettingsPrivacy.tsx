import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPrivacyAiDataProcessing } from '@/settings/privacy/components/SettingsPrivacyAiDataProcessing';
import { SettingsPrivacyCompliance } from '@/settings/privacy/components/SettingsPrivacyCompliance';
import { SettingsPrivacyHero } from '@/settings/privacy/components/SettingsPrivacyHero';
import { SettingsPrivacySafeguards } from '@/settings/privacy/components/SettingsPrivacySafeguards';
import { SettingsPrivacySharingWithTwenty } from '@/settings/privacy/components/SettingsPrivacySharingWithTwenty';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';
import { usePrivacyAudience } from '@/settings/privacy/hooks/usePrivacyAudience';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// hosting, certifications and the DPA describe Twenty Cloud, so self-hosted instances only get the controls
export const SettingsPrivacy = () => {
  const isTwentyCloud = useIsTwentyCloud();
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
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
      {isMultiWorkspaceEnabled && <SettingsPrivacySharingWithTwenty />}
      {shouldShowCloudSections && (
        <SettingsPrivacySafeguards privacyAudience={privacyAudience} />
      )}
    </>
  );
};
