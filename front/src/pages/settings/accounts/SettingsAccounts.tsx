import { useCallback } from 'react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { REACT_APP_SERVER_AUTH_URL } from '~/config';
import { useGenerateTransientTokenMutation } from '~/generated/graphql';

export const SettingsAccounts = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const handleGmailLogin = useCallback(async () => {
    const authServerUrl = REACT_APP_SERVER_AUTH_URL;

    const transientToken = await generateTransientToken();

    const token =
      transientToken.data?.generateTransientToken.transientToken.token;

    window.location.href = `${authServerUrl}/google-gmail?transientToken=${token}`;
  }, [generateTransientToken]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Accounts' }]} />
        <button onClick={handleGmailLogin}>Accounts</button>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
