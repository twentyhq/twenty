import { useCallback } from 'react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { REACT_APP_SERVER_AUTH_URL } from '~/config';
import { useGenerateShortTermTokenMutation } from '~/generated/graphql';

export const SettingsAccounts = () => {
  const [generateShortTermToken] = useGenerateShortTermTokenMutation();

  const handleGmailLogin = useCallback(async () => {
    const authServerUrl = REACT_APP_SERVER_AUTH_URL;

    const shortTermToken = await generateShortTermToken();

    const token =
      shortTermToken.data?.generateShortTermToken.shortTermToken.token;

    window.location.href = `${authServerUrl}/google-gmail?shortTermToken=${token}`;
  }, [generateShortTermToken]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Accounts' }]} />
        <button onClick={handleGmailLogin}>Accounts</button>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
