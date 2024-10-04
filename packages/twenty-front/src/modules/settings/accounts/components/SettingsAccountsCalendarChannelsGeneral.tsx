import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsAccountsCalendarDisplaySettings } from '@/settings/accounts/components/SettingsAccountsCalendarDisplaySettings';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { addMinutes, endOfDay, min, startOfDay } from 'date-fns';
import { useRecoilValue } from 'recoil';
import { H2Title } from 'twenty-ui';
import {
  CalendarChannelVisibility,
  TimelineCalendarEvent,
} from '~/generated/graphql';

const StyledGeneralContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsCalendarChannelsGeneral = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

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
        personId: '',
        workspaceMemberId: currentWorkspaceMember?.id || '',
      },
    ],
    endsAt: exampleEndDate.toISOString(),
    isFullDay: false,
    startsAt: exampleStartDate.toISOString(),
    conferenceSolution: '',
    conferenceLink: {
      primaryLinkLabel: '',
      primaryLinkUrl: '',
    },
    description: '',
    isCanceled: false,
    location: '',
    title: 'Onboarding call',
    visibility: CalendarChannelVisibility.ShareEverything,
  };

  return (
    <StyledGeneralContainer>
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
    </StyledGeneralContainer>
  );
};
