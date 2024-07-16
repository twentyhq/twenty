import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { H2Title } from 'twenty-ui';
import { CalendarChannelVisibility } from '~/generated-metadata/graphql';

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
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
          parameters={[
            {
              value: !!calendarChannel.isContactAutoCreationEnabled,
              title: 'Auto-creation',
              description: 'Automatically create contacts for people.',
              onToggle: handleContactAutoCreationToggle,
            },
          ]}
        />
      </Section>
    </StyledDetailsContainer>
  );
};
