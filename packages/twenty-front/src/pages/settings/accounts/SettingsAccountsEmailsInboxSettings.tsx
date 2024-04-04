import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { IconSettings, IconUser } from 'twenty-ui';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import {
  InboxSettingsVisibilityValue,
  SettingsAccountsInboxVisibilitySettingsCard,
} from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsAccountsEmailsInboxSettings = () => {
  const theme = useTheme();
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
        {/* TODO : discuss the desired sync behaviour and add Synchronization section */}
        <Section>
          <H2Title
            title="Email visibility"
            description="Define what will be visible to other users in your workspace"
          />
          <SettingsAccountsInboxVisibilitySettingsCard
            value={messageChannel.visibility}
            onChange={handleVisibilityChange}
          />
        </Section>
        <Section>
          <H2Title
            title="Contact auto-creation"
            description="Automatically create contacts for people you’ve sent emails to"
          />
          <SettingsAccountsToggleSettingCard
            cardMedia={
              <SettingsAccountsCardMedia>
                <IconUser
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.lg}
                />
              </SettingsAccountsCardMedia>
            }
            title="Auto-creation"
            value={!!messageChannel.isContactAutoCreationEnabled}
            onToggle={handleContactAutoCreationToggle}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
