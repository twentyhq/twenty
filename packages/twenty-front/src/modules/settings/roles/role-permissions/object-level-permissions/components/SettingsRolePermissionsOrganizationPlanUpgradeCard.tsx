import { billingState } from '@/client-config/states/billingState';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconArrowUp, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledCardContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

export const SettingsRolePermissionsOrganizationPlanUpgradeCard = () => {
  const navigateSettings = useNavigateSettings();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  return (
    <StyledCardContainer>
      <Card.Root>
        <SettingsOptionCardContentButton
          Icon={IconLock}
          title={t`Upgrade to access`}
          description={t`This feature is part of the Organization plan`}
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
    </StyledCardContainer>
  );
};
