import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { UPDATE_CALENDAR_CHANNEL } from '@/settings/accounts/graphql/mutations/updateCalendarChannel';
import { useMutation } from '@apollo/client/react';
import { SettingsAccountsCalendarChannelSyncedCategories } from '@/settings/accounts/components/SettingsAccountsCalendarChannelSyncedCategories';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from '@react-email/components';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { H2Title, IconUserPlus } from 'twenty-ui-deprecated/display';
import { Card } from 'twenty-ui-deprecated/layout';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { type CalendarChannelVisibility } from '~/generated/graphql';

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

type SettingsAccountsCalendarChannelDetailsProps = {
  calendarChannel: Pick<
    CalendarChannel,
    | 'id'
    | 'visibility'
    | 'isContactAutoCreationEnabled'
    | 'isSyncEnabled'
    | 'syncedCategories'
    | 'connectedAccountId'
  >;
};

export const SettingsAccountsCalendarChannelDetails = ({
  calendarChannel,
}: SettingsAccountsCalendarChannelDetailsProps) => {
  const [updateMetadataChannel] = useMutation(UPDATE_CALENDAR_CHANNEL);

  const { accounts } = useMyConnectedAccounts();

  const connectedAccount = accounts.find(
    (account) => account.id === calendarChannel.connectedAccountId,
  );

  // Categories are only available on Microsoft (Outlook) calendars.
  const supportsSyncedCategories =
    connectedAccount?.provider === ConnectedAccountProvider.MICROSOFT;

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

  const handleSyncedCategoriesChange = (syncedCategories: string[]) => {
    updateChannel({ syncedCategories });
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
      {supportsSyncedCategories && (
        <Section>
          <H2Title
            title={t`Synced categories`}
            description={t`Only sync events tagged with at least one of these Outlook categories. Leave empty to sync all events.`}
          />
          <SettingsAccountsCalendarChannelSyncedCategories
            syncedCategories={calendarChannel.syncedCategories}
            onSyncedCategoriesChange={handleSyncedCategoriesChange}
          />
        </Section>
      )}
    </StyledDetailsContainer>
  );
};
