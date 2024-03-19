import { addMinutes, endOfDay, min, startOfDay } from 'date-fns';
import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsCalendarAccountsListCard } from '@/settings/accounts/components/SettingsAccountsCalendarAccountsListCard';
import { SettingsAccountsCalendarDisplaySettings } from '@/settings/accounts/components/SettingsAccountsCalendarDisplaySettings';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';

export const SettingsAccountsCalendars = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState());
  const { records: _accounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  const exampleStartDate = new Date();
  const exampleEndDate = min([
    addMinutes(exampleStartDate, 30),
    endOfDay(exampleStartDate),
  ]);
  const exampleDayTime = startOfDay(exampleStartDate).getTime();
  const exampleCalendarEvent: CalendarEvent = {
    id: '',
    attendees: [
      {
        displayName: currentWorkspaceMember
          ? [
              currentWorkspaceMember.name.firstName,
              currentWorkspaceMember.name.lastName,
            ].join(' ')
          : '',
        workspaceMemberId: currentWorkspaceMember?.id ?? '',
      },
    ],
    endsAt: exampleEndDate.toISOString(),
    externalCreatedAt: new Date().toISOString(),
    isFullDay: false,
    startsAt: exampleStartDate.toISOString(),
    title: 'Onboarding call',
    visibility: 'SHARE_EVERYTHING',
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
          <SettingsAccountsCalendarAccountsListCard />
        </Section>
        {/* TODO: retrieve connected accounts data from back-end when the Calendar feature is ready. */}
        {!!mockedConnectedAccounts.length && (
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
