import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { type CalendarChannelVisibility } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import { Card } from 'twenty-ui/layout';
import { H2Title, IconUserPlus } from 'twenty-ui/display';

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
          title={t`Event visibility`}
          description={t`Define what will be visible to other users in your workspace`}
        />
        <SettingsAccountsEventVisibilitySettingsCard
          value={calendarChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title={t`Contact auto-creation`}
          description={t`Automatically create contacts for people you've participated in an event with.`}
        />
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconUserPlus}
            title={t`Auto-creation`}
            description={t`Automatically create contacts for people.`}
            checked={calendarChannel.isContactAutoCreationEnabled}
            onChange={() => {
              handleContactAutoCreationToggle(
                !calendarChannel.isContactAutoCreationEnabled,
              );
            }}
          />
        </Card>
      </Section>
    </StyledDetailsContainer>
  );
};
