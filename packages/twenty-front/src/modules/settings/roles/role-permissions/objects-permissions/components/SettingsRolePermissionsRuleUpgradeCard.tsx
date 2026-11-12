/* @license Enterprise */

import { billingState } from '@/client-config/states/billingState';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconArrowUp, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsRolePermissionsRuleUpgradeCard = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  return (
    <Card.Root>
      <SettingsOptionCardContentButton
        Icon={IconLock}
        title={t`Upgrade to access`}
        description={t`Rules on some records are part of the Organization plan`}
        Button={
          <Button
            size="sm"
            startIcon={<IconArrowUp />}
            onClick={() =>
              navigateSettings(
                isBillingEnabled
                  ? SettingsPath.BillingPlans
                  : SettingsPath.AdminPanelOrganization,
              )
            }
            variant="solid"
            color="accent"
          >{t`Upgrade`}</Button>
        }
      />
    </Card.Root>
  );
};
