import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPrivacyAiDataProcessing } from '@/settings/privacy/components/SettingsPrivacyAiDataProcessing';
import { SettingsPrivacyCompliance } from '@/settings/privacy/components/SettingsPrivacyCompliance';
import { SettingsPrivacyHero } from '@/settings/privacy/components/SettingsPrivacyHero';
import { SettingsPrivacySafeguards } from '@/settings/privacy/components/SettingsPrivacySafeguards';
import { SettingsPrivacySharingWithTwenty } from '@/settings/privacy/components/SettingsPrivacySharingWithTwenty';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsPrivacy = () => {
  const isTwentyCloud = useIsTwentyCloud();
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  return (
    <>
      {isTwentyCloud && (
        <>
          <SettingsPrivacyHero />
          <SettingsPrivacyCompliance />
        </>
      )}
      {isAiDataPolicyConfigurable && <SettingsPrivacyAiDataProcessing />}
      {isMultiWorkspaceEnabled && <SettingsPrivacySharingWithTwenty />}
      {isTwentyCloud && <SettingsPrivacySafeguards />}
    </>
  );
};
