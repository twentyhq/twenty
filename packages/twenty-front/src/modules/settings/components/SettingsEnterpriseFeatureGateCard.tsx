import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { IconArrowUp, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Card } from 'twenty-ui/surfaces';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsEnterpriseFeatureGateCard = ({
  title,
  description,
  buttonTitle,
}: {
  title: string;
  description: string;
  buttonTitle: string;
}) => {
  const currentUser = useAtomStateValue(currentUserState);
  const billing = useAtomStateValue(billingState);
  const navigateSettings = useNavigateSettings();

  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const canAccessAdminPanel = currentUser?.canAccessFullAdminPanel === true;
  const canDisplayUpgradeButton = isBillingEnabled || canAccessAdminPanel;
  const upgradeSettingsPath = isBillingEnabled
    ? SettingsPath.BillingPlans
    : SettingsPath.AdminPanelEnterprise;

  return (
    <Card rounded>
      <SettingsOptionCardContentButton
        Icon={IconLock}
        title={title}
        description={description}
        Button={
          canDisplayUpgradeButton ? (
            <Button
              title={buttonTitle}
              variant="primary"
              accent="blue"
              size="small"
              Icon={IconArrowUp}
              onClick={() => navigateSettings(upgradeSettingsPath)}
            />
          ) : undefined
        }
      />
    </Card>
  );
};
