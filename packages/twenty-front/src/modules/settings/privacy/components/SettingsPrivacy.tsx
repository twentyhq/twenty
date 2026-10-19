import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPrivacyAiDataProcessing } from '@/settings/privacy/components/SettingsPrivacyAiDataProcessing';
import { SettingsPrivacyCompliance } from '@/settings/privacy/components/SettingsPrivacyCompliance';
import { SettingsPrivacyHero } from '@/settings/privacy/components/SettingsPrivacyHero';
import { SettingsPrivacySafeguards } from '@/settings/privacy/components/SettingsPrivacySafeguards';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// hosting, certifications and the DPA describe Twenty Cloud, so self-hosted instances only get the AI controls
export const SettingsPrivacy = () => {
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();

  return (
    <>
      {isMultiWorkspaceEnabled && (
        <>
          <SettingsPrivacyHero />
          <SettingsPrivacyCompliance />
        </>
      )}
      {isAiDataPolicyConfigurable && <SettingsPrivacyAiDataProcessing />}
      {isMultiWorkspaceEnabled && <SettingsPrivacySafeguards />}
    </>
  );
};
