import { useLingui } from '@lingui/react/macro';

import { billingState } from '@/client-config/states/billingState';
import { isEmailingDomainInDemoModeState } from '@/client-config/states/isEmailingDomainInDemoModeState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsWorkspaceUnsubscribeTopicSection } from '@/settings/unsubscribe-topics/components/SettingsWorkspaceUnsubscribeTopicSection';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconArrowUp, IconLock } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Card } from 'twenty-ui-deprecated/layout';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsWorkspaceEmail = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const isEmailingDomainInDemoMode = useAtomStateValue(
    isEmailingDomainInDemoModeState,
  );
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  if (!isEmailGroupFeatureEnabled) {
    return null;
  }

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
          <Card
            rounded
            backgroundColor={themeCssVariables.background.secondary}
          >
            <SettingsOptionCardContentButton
              Icon={IconLock}
              title={t`Emailing is in demo mode`}
              description={t`Emails are logged, not sent. Sending requires the AWS SES driver with an Enterprise license, or Twenty Cloud.`}
              Button={
                <Button
                  title={t`Upgrade`}
                  variant="primary"
                  accent="blue"
                  size="small"
                  Icon={IconArrowUp}
                  onClick={() =>
                    navigateSettings(
                      isBillingEnabled
                        ? SettingsPath.Billing
                        : SettingsPath.AdminPanelEnterprise,
                    )
                  }
                />
              }
            />
          </Card>
        )}
        <SettingsWorkspaceEmailGroupSection />
        <SettingsWorkspaceUnsubscribeTopicSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
