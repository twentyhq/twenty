import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import {
  IconApps,
  IconHeart,
  IconKey,
  IconSettings2,
  IconSparkles,
  IconVariable,
} from 'twenty-ui/icon';

export const useSettingsAdminTabs = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const billing = useAtomStateValue(billingState);

  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel;
  const canImpersonate = currentUser?.canImpersonate;
  const isBillingEnabled = billing?.isBillingEnabled;

  return [
    {
      id: SETTINGS_ADMIN_TABS.GENERAL,
      title: t`General`,
      Icon: IconSettings2,
      disabled: !canAccessFullAdminPanel && !canImpersonate,
    },
    {
      id: SETTINGS_ADMIN_TABS.APPS,
      title: t`Apps`,
      Icon: IconApps,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.AI,
      title: t`AI`,
      Icon: IconSparkles,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CONFIG_VARIABLES,
      title: t`Config`,
      Icon: IconVariable,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.HEALTH_STATUS,
      title: t`Health`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    ...(!isBillingEnabled
      ? [
          {
            id: SETTINGS_ADMIN_TABS.ENTERPRISE,
            title: t`Enterprise`,
            Icon: IconKey,
            disabled: !canAccessFullAdminPanel && !canImpersonate,
          },
        ]
      : []),
  ];
};
