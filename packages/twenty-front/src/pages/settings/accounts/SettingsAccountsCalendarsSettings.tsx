import { useParams } from 'react-router-dom';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';

export const SettingsAccountsCalendarsSettings = () => {
  const { accountUuid = '' } = useParams();
  const connectedAccount = mockedConnectedAccounts.find(
    ({ id }) => id === accountUuid,
  );

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Accounts',
              href: getSettingsPagePath(SettingsPath.Accounts),
            },
            {
              children: 'Calendars',
              href: getSettingsPagePath(SettingsPath.AccountsCalendars),
            },
            { children: connectedAccount?.handle || '' },
          ]}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
