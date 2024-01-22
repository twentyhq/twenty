import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
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

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: 'messageChannel',
  });

  const handleVisibilityChange = (_value: InboxSettingsVisibilityValue) => {
    updateOneRecord({
      idToUpdate: messageChannelId,
      updateOneRecordInput: {
        visibility: _value,
      },
    });
  };

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
        {/* TODO : discuss the desired sync behaviour */}
        {/* <SettingsAccountsInboxSettingsSynchronizationSection
          messageChannel={messageChannel}
          onToggle={handleSynchronizationToggle}
        /> */}
        <SettingsAccountsInboxSettingsVisibilitySection
          value={messageChannel?.visibility}
          onChange={handleVisibilityChange}
        />
        {/* TODO : Add this section when the backend will be ready to auto create contacts */}
        {/* <SettingsAccountsInboxSettingsContactAutoCreateSection
          messageChannel={messageChannel}
          onToggle={handleContactAutoCreationToggle}
        /> */}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
