import { useCallback } from 'react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { REACT_APP_SERVER_AUTH_URL } from '~/config';

export const SettingsAccounts = () => {
  const handleGmailLogin = useCallback(() => {
    const authServerUrl = REACT_APP_SERVER_AUTH_URL;
    console.log('authServerUrl', authServerUrl);
    window.location.href = `${authServerUrl}/google-gmail` || '';
  }, []);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Accounts' }]} />
        <button onClick={handleGmailLogin}>Accounts</button>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
