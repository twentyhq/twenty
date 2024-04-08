import { addMinutes, endOfDay, min, startOfDay } from 'date-fns';
import { useRecoilValue } from 'recoil';
import { IconSettings } from 'twenty-ui';

import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsCalendarChannelsListCard } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsListCard';
import { SettingsAccountsCalendarDisplaySettings } from '@/settings/accounts/components/SettingsAccountsCalendarDisplaySettings';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import {
  TimelineCalendarEvent,
  TimelineCalendarEventVisibility,
} from '~/generated-metadata/graphql';

export const SettingsAccountsCalendars = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { records: accounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  const { records: calendarChannels } = useFindManyRecords<CalendarChannel>({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
    filter: {
      connectedAccountId: {
        in: accounts.map((account) => account.id),
      },
    },
  });

  const exampleStartDate = new Date();
  const exampleEndDate = min([
    addMinutes(exampleStartDate, 30),
    endOfDay(exampleStartDate),
  ]);
  const exampleDayTime = startOfDay(exampleStartDate).getTime();
  const exampleCalendarEvent: TimelineCalendarEvent = {
    id: '',
    participants: [
      {
        firstName: currentWorkspaceMember?.name.firstName || '',
        lastName: currentWorkspaceMember?.name.lastName || '',
        displayName: currentWorkspaceMember
          ? [
              currentWorkspaceMember.name.firstName,
              currentWorkspaceMember.name.lastName,
            ].join(' ')
          : '',
        avatarUrl: currentWorkspaceMember?.avatarUrl || '',
        handle: '',
      },
    ],
    endsAt: exampleEndDate.toISOString(),
    isFullDay: false,
    startsAt: exampleStartDate.toISOString(),
    conferenceSolution: '',
    conferenceLink: {
      label: '',
      url: '',
    },
    description: '',
    isCanceled: false,
    location: '',
    title: 'Onboarding call',
    visibility: TimelineCalendarEventVisibility.ShareEverything,
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Accounts',
              href: getSettingsPagePath(SettingsPath.Accounts),
            },
            { children: 'Calendars' },
          ]}
        />
        <Section>
          <H2Title
            title="Calendar settings"
            description="Sync your calendars and set your preferences"
          />
          <SettingsAccountsCalendarChannelsListCard />
        </Section>
        {!!calendarChannels.length && (
          <>
            <Section>
              <H2Title
                title="Display"
                description="Configure how we should display your events in your calendar"
              />
              <SettingsAccountsCalendarDisplaySettings />
            </Section>
            <Section>
              <H2Title
                title="Color code"
                description="Events you participated in are displayed in red."
              />
              <CalendarContext.Provider
                value={{
                  currentCalendarEvent: exampleCalendarEvent,
                  calendarEventsByDayTime: {
                    [exampleDayTime]: [exampleCalendarEvent],
                  },
                  getNextCalendarEvent: () => undefined,
                  updateCurrentCalendarEvent: () => {},
                }}
              >
                <CalendarMonthCard dayTimes={[exampleDayTime]} />
              </CalendarContext.Provider>
            </Section>
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
