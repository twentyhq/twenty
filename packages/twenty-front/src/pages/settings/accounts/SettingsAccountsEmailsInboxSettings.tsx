import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SettingsAccountsInboxSettingsSynchronizationSection } from '@/settings/accounts/components/SettingsAccountsInboxSettingsSynchronizationSection';
import {
  InboxSettingsVisibilityValue,
  SettingsAccountsInboxSettingsVisibilitySection,
} from '@/settings/accounts/components/SettingsAccountsInboxSettingsVisibilitySection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { mockedAccounts } from '~/testing/mock-data/accounts';

export const SettingsAccountsEmailsInboxSettings = () => {
  const navigate = useNavigate();
  const { accountUuid = '' } = useParams();
  const account = mockedAccounts.find(
    (account) => account.uuid === accountUuid,
  );

  useEffect(() => {
    if (!account) navigate(AppPath.NotFound);
  }, [account, navigate]);

  if (!account) return null;

  const handleSynchronizationToggle = (_value: boolean) => {};

  const handleVisibilityChange = (_value: InboxSettingsVisibilityValue) => {};

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Accounts', href: '/settings/accounts' },
            { children: 'Emails', href: '/settings/accounts/emails' },
            { children: account?.email || '' },
          ]}
        />
        <SettingsAccountsInboxSettingsSynchronizationSection
          account={account}
          onToggle={handleSynchronizationToggle}
        />
        <SettingsAccountsInboxSettingsVisibilitySection
          value={account.visibility}
          onChange={handleVisibilityChange}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
