import { billingState } from '@/client-config/states/billingState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useOpenEnterpriseUpgrade } from '@/settings/enterprise/hooks/useOpenEnterpriseUpgrade';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { SupportDriver } from '~/generated-metadata/graphql';

export const useSupportAccess = () => {
  const billing = useAtomStateValue(billingState);
  const supportChat = useAtomStateValue(supportChatState);
  const openEnterpriseUpgrade = useOpenEnterpriseUpgrade();

  const isSelfHosting = billing?.isBillingEnabled !== true;
  const isSupportChatConfigured =
    supportChat?.supportDriver === SupportDriver.FRONT &&
    isNonEmptyString(supportChat.supportFrontChatId);

  // Support is an Enterprise feature on self-hosted instances: without a plan,
  // the entry point becomes an upgrade path instead of a chat.
  const isSupportAvailable = isSupportChatConfigured || isSelfHosting;

  const openSupport = useCallback(() => {
    if (isSupportChatConfigured) {
      window.FrontChat?.('show');

      return;
    }

    openEnterpriseUpgrade();
  }, [isSupportChatConfigured, openEnterpriseUpgrade]);

  return { isSupportAvailable, openSupport };
};
