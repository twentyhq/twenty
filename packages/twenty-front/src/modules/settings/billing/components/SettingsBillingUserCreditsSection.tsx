import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconCoins } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateUserCreditsFallback } from '@/settings/billing/hooks/useUpdateUserCreditsFallback';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  PermissionFlagType,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';

export const SettingsBillingUserCreditsSection = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { updateUserCreditsFallback, loading } = useUpdateUserCreditsFallback();

  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const billingCustomer = currentWorkspace?.billingCustomer;

  if (
    !hasPermissionToManageBilling ||
    !isDefined(billingCustomer) ||
    !billingCustomer.hasUserCredits
  ) {
    return null;
  }

  const { userCreditsFallback } = billingCustomer;

  return (
    <Section.Root>
      <Section.Header
        title={t`User credits`}
        description={t`Each member spends their own AI credits before workspace credits`}
      />
      <Card.Root>
        <SettingsOptionCardContentSwitch
          Icon={IconCoins}
          title={t`Use workspace credits when a member runs out`}
          description={t`When off, a member's AI chats stop until their credits renew`}
          checked={
            userCreditsFallback === UserCreditsFallback.WORKSPACE_CREDITS
          }
          disabled={loading}
          onChange={(checked) =>
            updateUserCreditsFallback(
              checked
                ? UserCreditsFallback.WORKSPACE_CREDITS
                : UserCreditsFallback.STOP,
            )
          }
        />
      </Card.Root>
    </Section.Root>
  );
};
