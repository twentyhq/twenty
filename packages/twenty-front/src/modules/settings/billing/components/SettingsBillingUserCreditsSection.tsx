import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconCoins } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  PermissionFlagType,
  UpdateUserCreditsFallbackDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';

export const SettingsBillingUserCreditsSection = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateUserCreditsFallback, { loading }] = useMutation(
    UpdateUserCreditsFallbackDocument,
  );

  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const billingCustomer = currentWorkspace?.billingCustomer;

  if (
    !hasPermissionToManageBilling ||
    !isDefined(currentWorkspace) ||
    !isDefined(billingCustomer) ||
    !currentWorkspace.currentBillingSubscription?.hasUserCredits
  ) {
    return null;
  }

  const handleUserCreditsFallbackChange = async (checked: boolean) => {
    const userCreditsFallback = checked
      ? UserCreditsFallback.WORKSPACE_CREDITS
      : UserCreditsFallback.STOP;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        billingCustomer: { ...billingCustomer, userCreditsFallback },
      });

      await updateUserCreditsFallback({ variables: { userCreditsFallback } });
    } catch (error) {
      setCurrentWorkspace(currentWorkspace);
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

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
            billingCustomer.userCreditsFallback ===
            UserCreditsFallback.WORKSPACE_CREDITS
          }
          disabled={loading}
          onChange={handleUserCreditsFallbackChange}
        />
      </Card.Root>
    </Section.Root>
  );
};
