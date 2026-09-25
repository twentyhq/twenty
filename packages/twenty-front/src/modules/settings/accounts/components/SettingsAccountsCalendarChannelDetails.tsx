import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { UPDATE_CALENDAR_CHANNEL } from '@/settings/accounts/graphql/mutations/updateCalendarChannel';
import { useMutation } from '@apollo/client/react';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components';
import { IconUserPlus } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { type CalendarChannelVisibility } from '~/generated/graphql';

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
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
  const [updateMetadataChannel] = useMutation(UPDATE_CALENDAR_CHANNEL);

  const updateChannel = (update: Record<string, unknown>) => {
    updateMetadataChannel({
      variables: { input: { id: calendarChannel.id, update } },
    });
  };

  const handleVisibilityChange = (value: CalendarChannelVisibility) => {
    updateChannel({ visibility: value });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateChannel({ isContactAutoCreationEnabled: value });
  };

  return (
    <StyledDetailsContainer>
      <Section.Root>
        <Section.Header
          title={t`Event visibility`}
          description={t`Define what will be visible to other users in your workspace`}
        />
        <SettingsAccountsEventVisibilitySettingsCard
          value={calendarChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Contact auto-creation`}
          description={t`Automatically create contacts for people you've participated in an event with.`}
        />
        <Card.Root rounded>
          <SettingsOptionCardContentSwitch
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
        </Card.Root>
      </Section.Root>
    </StyledDetailsContainer>
  );
};
