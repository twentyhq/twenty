import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SettingsAccountsInboxSettingsContactAutoCreateSection } from '@/settings/accounts/components/SettingsAccountsInboxSettingsContactAutoCreationSection';
import { SettingsAccountsInboxSettingsSynchronizationSection } from '@/settings/accounts/components/SettingsAccountsInboxSettingsSynchronizationSection';
import {
  InboxSettingsVisibilityValue,
  SettingsAccountsInboxSettingsVisibilitySection,
} from '@/settings/accounts/components/SettingsAccountsInboxSettingsVisibilitySection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { mockedAccounts } from '~/testing/mock-data/accounts';

export const SettingsAccountsEmailsInboxSettings = () => {
  const { translate } = useI18n('translations');

  const navigate = useNavigate();
  const { accountUuid = '' } = useParams();
  const account = mockedAccounts.find((account) => account.id === accountUuid);

  useEffect(() => {
    if (!account) navigate(AppPath.NotFound);
  }, [account, navigate]);

  if (!account) return null;

  const handleSynchronizationToggle = (_value: boolean) => {};

  const handleContactAutoCreationToggle = (_value: boolean) => {};

  const handleVisibilityChange = (_value: InboxSettingsVisibilityValue) => {};

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: translate('accounts'), href: '/settings/accounts' },
            {
              children: translate('emails'),
              href: '/settings/accounts/emails',
            },
            { children: account?.handle || '' },
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
        <SettingsAccountsInboxSettingsContactAutoCreateSection
          account={account}
          onToggle={handleContactAutoCreationToggle}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
