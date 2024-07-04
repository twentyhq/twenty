import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { H2Title, IconRefresh, IconUser } from 'twenty-ui';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { SettingsAccountsInboxVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { Section } from '@/ui/layout/section/components/Section';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';

type SettingsAccountsMessageChannelDetailsProps = {
  messageChannel: Pick<
    MessageChannel,
    'id' | 'visibility' | 'isContactAutoCreationEnabled' | 'isSyncEnabled'
  >;
};

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsMessageChannelDetails = ({
  messageChannel,
}: SettingsAccountsMessageChannelDetailsProps) => {
  const theme = useTheme();

  const { updateOneRecord } = useUpdateOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

  const handleVisibilityChange = (value: MessageChannelVisibility) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        isContactAutoCreationEnabled: value,
      },
    });
  };

  const handleIsSyncEnabledToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        isSyncEnabled: value,
      },
    });
  };

  return (
    <StyledDetailsContainer>
      <Section>
        <H2Title
          title="Visibility"
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
      <Section>
        <H2Title
          title="Synchronization"
          description="Past and future emails will automatically be synced to this workspace"
        />
        <SettingsAccountsToggleSettingCard
          cardMedia={
            <SettingsAccountsCardMedia>
              <IconRefresh
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.lg}
              />
            </SettingsAccountsCardMedia>
          }
          title="Sync emails"
          value={!!messageChannel.isSyncEnabled}
          onToggle={handleIsSyncEnabledToggle}
        />
      </Section>
    </StyledDetailsContainer>
  );
};
