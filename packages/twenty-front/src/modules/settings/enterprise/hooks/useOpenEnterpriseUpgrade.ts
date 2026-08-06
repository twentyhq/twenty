import { useCanAccessAdminPanel } from '@/settings/admin-panel/hooks/useCanAccessAdminPanel';
import { ENTERPRISE_REQUIRED_MODAL_ID } from '@/settings/enterprise/components/EnterpriseRequiredModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

// Members who cannot reach the admin panel have nowhere to upgrade, so they get
// an explanation pointing them at their server admin instead.
export const useOpenEnterpriseUpgrade = () => {
  const canAccessAdminPanel = useCanAccessAdminPanel();
  const navigateSettings = useNavigateSettings();
  const { openModal } = useModal();

  return useCallback(() => {
    if (canAccessAdminPanel) {
      navigateSettings(SettingsPath.AdminPanelEnterprise);

      return;
    }

    openModal(ENTERPRISE_REQUIRED_MODAL_ID);
  }, [canAccessAdminPanel, navigateSettings, openModal]);
};
