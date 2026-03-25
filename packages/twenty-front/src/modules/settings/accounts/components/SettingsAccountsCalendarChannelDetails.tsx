import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { UPDATE_CALENDAR_CHANNEL } from '@/settings/accounts/graphql/mutations/updateCalendarChannel';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useMutation } from '@apollo/client/react';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from '@react-email/components';
import { H2Title, IconUserPlus } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const { updateOneRecord } = useUpdateOneRecord();
  const [updateMetadataChannel] = useMutation(UPDATE_CALENDAR_CHANNEL);

  const updateChannel = (update: Record<string, unknown>) => {
    if (isMigrated) {
      updateMetadataChannel({
        variables: { input: { id: calendarChannel.id, update } },
      });
    } else {
      updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.CalendarChannel,
        idToUpdate: calendarChannel.id,
        updateOneRecordInput: update,
      });
    }
  };

  const handleVisibilityChange = (value: CalendarChannelVisibility) => {
    updateChannel({ visibility: value });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateChannel({ isContactAutoCreationEnabled: value });
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
