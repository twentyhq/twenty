import { useLingui } from '@lingui/react/macro';

import { isEmailGroupEnabledState } from '@/client-config/states/isEmailGroupEnabledState';
import { isEmailingDomainInDemoModeState } from '@/client-config/states/isEmailingDomainInDemoModeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsWorkspaceEmailingDomainsSection } from '@/settings/workspace/components/SettingsWorkspaceEmailingDomainsSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsWorkspaceEmail = () => {
  const { t } = useLingui();

  const isEmailGroupEnabled = useAtomStateValue(isEmailGroupEnabledState);
  const isEmailingDomainInDemoMode = useAtomStateValue(
    isEmailingDomainInDemoModeState,
  );
  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  if (!isEmailGroupFeatureEnabled) {
    return null;
  }

  const showEmailGroupSection = isEmailGroupEnabled;

  return (
    <SettingsPageLayout
      title={t`Email`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Email` },
      ]}
    >
      <SettingsPageContainer>
        {isEmailingDomainInDemoMode && (
          <InformationBanner
            componentInstanceId="information-banner-emailing-domain-demo-mode"
            message={t`Demo mode: emails are logged, not sent. Sending is available with the AWS SES driver and an Enterprise license, or on Twenty Cloud.`}
          />
        )}
        {showEmailGroupSection && <SettingsWorkspaceEmailGroupSection />}
        <SettingsWorkspaceEmailingDomainsSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
