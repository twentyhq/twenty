import { currentUserState } from '@/auth/states/currentUserState';
import { ENTERPRISE_REQUIRED_MODAL_ID } from '@/settings/enterprise/components/EnterpriseRequiredModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useOpenEnterpriseUpgrade = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const navigateSettings = useNavigateSettings();
  const { openModal } = useModal();

  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel === true;

  return useCallback(() => {
    if (canAccessFullAdminPanel) {
      navigateSettings(SettingsPath.AdminPanelEnterprise);

      return;
    }

    openModal(ENTERPRISE_REQUIRED_MODAL_ID);
  }, [canAccessFullAdminPanel, navigateSettings, openModal]);
};
