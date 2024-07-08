import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { H2Title, IconRefresh, IconUser } from 'twenty-ui';
import { CalendarChannelVisibility } from '~/generated-metadata/graphql';

const StyledCardMedia = styled(SettingsAccountsCardMedia)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(6)};
`;

type SettingsAccountsCalendarChannelDetailsProps = {
  calendarChannel: Pick<
    CalendarChannel,
    'id' | 'visibility' | 'isContactAutoCreationEnabled' | 'isSyncEnabled'
  >;
};

export const SettingsAccountsCalendarChannelDetails = ({
  calendarChannel,
}: SettingsAccountsCalendarChannelDetailsProps) => {
  const theme = useTheme();

  const { updateOneRecord } = useUpdateOneRecord<CalendarChannel>({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
  });

  const handleVisibilityChange = (value: CalendarChannelVisibility) => {
    updateOneRecord({
      idToUpdate: calendarChannel.id,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: calendarChannel.id,
      updateOneRecordInput: {
        isContactAutoCreationEnabled: value,
      },
    });
  };

  const handleSyncEventsToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: calendarChannel.id,
      updateOneRecordInput: {
        isSyncEnabled: value,
      },
    });
  };
  return (
    <StyledDetailsContainer>
      <Section>
        <H2Title
          title="Event visibility"
          description="Define what will be visible to other users in your workspace"
        />
        <SettingsAccountsEventVisibilitySettingsCard
          value={calendarChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title="Contact auto-creation"
          description="Automatically create contacts for people you've participated in an event with."
        />
        <SettingsAccountsToggleSettingCard
          cardMedia={
            <StyledCardMedia>
              <IconUser
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.lg}
              />
            </StyledCardMedia>
          }
          title="Auto-creation"
          value={!!calendarChannel.isContactAutoCreationEnabled}
          onToggle={handleContactAutoCreationToggle}
        />
      </Section>
      <Section>
        <H2Title
          title="Synchronization"
          description="Past and future calendar events will automatically be synced to this workspace"
        />
        <SettingsAccountsToggleSettingCard
          cardMedia={
            <StyledCardMedia>
              <IconRefresh
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.lg}
              />
            </StyledCardMedia>
          }
          title="Sync events"
          value={!!calendarChannel.isSyncEnabled}
          onToggle={handleSyncEventsToggle}
        />
      </Section>
    </StyledDetailsContainer>
  );
};
