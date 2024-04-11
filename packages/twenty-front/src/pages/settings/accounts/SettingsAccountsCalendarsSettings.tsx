import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconRefresh, IconSettings, IconUser } from 'twenty-ui';

import {
  CalendarChannel,
  CalendarChannelVisibility,
} from '@/accounts/types/CalendarChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledCardMedia = styled(SettingsAccountsCardMedia)`
  height: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsCalendarsSettings = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { accountUuid: calendarChannelId = '' } = useParams();

  const { record: calendarChannel, loading } =
    useFindOneRecord<CalendarChannel>({
      objectNameSingular: CoreObjectNameSingular.CalendarChannel,
      objectRecordId: calendarChannelId,
    });

  const { updateOneRecord } = useUpdateOneRecord<CalendarChannel>({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
  });

  const handleVisibilityChange = (value: CalendarChannelVisibility) => {
    updateOneRecord({
      idToUpdate: calendarChannelId,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: calendarChannelId,
      updateOneRecordInput: {
        isContactAutoCreationEnabled: value,
      },
    });
  };

  const handleSyncEventsToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: calendarChannelId,
      updateOneRecordInput: {
        isSyncEnabled: value,
      },
    });
  };

  useEffect(() => {
    if (!loading && !calendarChannel) navigate(AppPath.NotFound);
  }, [loading, calendarChannel, navigate]);

  if (!calendarChannel) return null;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Accounts',
              href: getSettingsPagePath(SettingsPath.Accounts),
            },
            {
              children: 'Calendars',
              href: getSettingsPagePath(SettingsPath.AccountsCalendars),
            },
            { children: calendarChannel?.handle || '' },
          ]}
        />
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
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
