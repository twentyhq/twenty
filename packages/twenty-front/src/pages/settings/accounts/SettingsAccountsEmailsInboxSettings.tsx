import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  InboxSettingsVisibilityValue,
  SettingsAccountsInboxSettingsVisibilitySection,
} from '@/settings/accounts/components/SettingsAccountsInboxSettingsVisibilitySection';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { IconSettings, IconUser } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsAccountsEmailsInboxSettings = () => {
  const navigate = useNavigate();
  const { accountUuid: messageChannelId = '' } = useParams();

  const { record: messageChannel, loading } = useFindOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    objectRecordId: messageChannelId,
  });

  const { updateOneRecord } = useUpdateOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

  const handleVisibilityChange = (value: InboxSettingsVisibilityValue) => {
    updateOneRecord({
      idToUpdate: messageChannelId,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannelId,
      updateOneRecordInput: {
        isContactAutoCreationEnabled: value,
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
            { children: messageChannel.handle || '' },
          ]}
        />
        {/* TODO : discuss the desired sync behaviour */}
        {/* <Section>
          <H2Title
            title="Synchronization"
            description="Past and future emails will automatically be synced to this workspace"
          />
          <SettingsAccountsSettingCard
            Icon={IconRefresh}
            title="Sync emails"
            isEnabled={!!messageChannel.isSynced}
            onToggle={handleSynchronizationToggle}
          />
        </Section> */}
        <SettingsAccountsInboxSettingsVisibilitySection
          value={messageChannel.visibility}
          onChange={handleVisibilityChange}
        />
        <Section>
          <H2Title
            title="Contact auto-creation"
            description="Automatically create contacts for people you’ve sent emails to"
          />
          <SettingsAccountsToggleSettingCard
            Icon={IconUser}
            title="Auto-creation"
            isEnabled={!!messageChannel.isContactAutoCreationEnabled}
            onToggle={handleContactAutoCreationToggle}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
