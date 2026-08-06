import { billingState } from '@/client-config/states/billingState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useCanAccessAdminPanel } from '@/settings/admin-panel/hooks/useCanAccessAdminPanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { SupportDriver } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useSupportAccess = () => {
  const billing = useAtomStateValue(billingState);
  const supportChat = useAtomStateValue(supportChatState);
  const canAccessAdminPanel = useCanAccessAdminPanel();
  const navigateSettings = useNavigateSettings();

  const isSelfHosting = billing?.isBillingEnabled !== true;
  const isSupportChatConfigured =
    supportChat?.supportDriver === SupportDriver.FRONT &&
    isNonEmptyString(supportChat.supportFrontChatId);

  // Support is an Enterprise feature on self-hosted instances: without a plan,
  // the entry point becomes an upgrade path, which only admins can act on.
  const isSupportAvailable =
    isSupportChatConfigured || (isSelfHosting && canAccessAdminPanel);

  const openSupport = useCallback(() => {
    if (isSupportChatConfigured) {
      window.FrontChat?.('show');

      return;
    }

    navigateSettings(SettingsPath.AdminPanelEnterprise);
  }, [isSupportChatConfigured, navigateSettings]);

  return { isSupportAvailable, openSupport };
};
