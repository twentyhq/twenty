import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SettingsAccountsInboxSettingsContactAutoCreateSection } from '@/settings/accounts/components/SettingsAccountsInboxSettingsContactAutoCreationSection';
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

export const SettingsAccountsEmailsInboxSettings = () => {
  const navigate = useNavigate();
  const { accountUuid: messageChannelId = '' } = useParams();

  const { record: messageChannel, loading } = useFindOneRecord<MessageChannel>({
    objectNameSingular: 'messageChannel',
    objectRecordId: messageChannelId,
  });

  const handleSynchronizationToggle = (_value: boolean) => {};

  const handleContactAutoCreationToggle = (_value: boolean) => {};

  const handleVisibilityChange = (_value: InboxSettingsVisibilityValue) => {};

  useEffect(() => {
    if (!loading && !messageChannel) navigate(AppPath.NotFound);
  }, [loading, messageChannel, navigate]);

  if (!messageChannel) return null;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Accounts', href: '/settings/accounts' },
            { children: 'Emails', href: '/settings/accounts/emails' },
            { children: messageChannel?.handle || '' },
          ]}
        />
        <SettingsAccountsInboxSettingsSynchronizationSection
          account={messageChannel}
          onToggle={handleSynchronizationToggle}
        />
        <SettingsAccountsInboxSettingsVisibilitySection
          value={messageChannel?.visibility}
          onChange={handleVisibilityChange}
        />
        <SettingsAccountsInboxSettingsContactAutoCreateSection
          account={messageChannel}
          onToggle={handleContactAutoCreationToggle}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
