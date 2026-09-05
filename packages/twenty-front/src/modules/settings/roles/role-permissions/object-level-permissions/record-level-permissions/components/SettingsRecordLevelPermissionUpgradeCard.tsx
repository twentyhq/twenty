/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconArrowUp, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { billingState } from '@/client-config/states/billingState';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledCardContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

export const SettingsRecordLevelPermissionUpgradeCard = () => {
  const navigateSettings = useNavigateSettings();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  return (
    <StyledCardContainer>
      <Card rounded>
        <SettingsOptionCardContentButton
          Icon={IconLock}
          title={t`Upgrade to access`}
          description={t`This feature is part of the Enterprise Plan`}
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
                    ? SettingsPath.BillingPlans
                    : SettingsPath.AdminPanelEnterprise,
                )
              }
            />
          }
        />
      </Card>
    </StyledCardContainer>
  );
};
