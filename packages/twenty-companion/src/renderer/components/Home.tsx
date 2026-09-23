import { Section } from '@ui/components/layout/Section/Section';
import { useNow } from '../hooks/useNow';
import { MeetingRow } from './MeetingRow';
import { i18n } from '@lingui/core';
import { SettingsCardContent } from './SettingsCardContent';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { CalendarDayLabel } from './CalendarDayLabel';
import { useState } from 'react';
import {
  IconCalendarEvent,
  IconArrowUpRight,
  IconChevronRight,
} from 'twenty-ui/icon';
import { getUpcomingMeetings } from '../../shared/utils/getUpcomingMeetings';
import { Button } from '@ui/primitives/input/Button/Button';
import { type ActionProps } from '../types/ActionProps';
import { RecordingList } from './RecordingList';

const UpcomingMeetings = ({ state, isPending, command }: ActionProps) => {
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const now = useNow(1000);
  const meetings = getUpcomingMeetings({ meetings: state.meetings, now: now });
  const calendarTitle = new Date(
    meetings[0]?.startsAt ?? now,
  ).toLocaleDateString([], { month: 'long' });
  const visibleMeetings = showAllMeetings ? meetings : meetings.slice(0, 3);
  const meetingDays = new Map<string, typeof visibleMeetings>();
  for (const meeting of visibleMeetings) {
    const day = new Date(meeting.startsAt).toDateString();
    const dayMeetings = meetingDays.get(day) ?? [];
    dayMeetings.push(meeting);
    meetingDays.set(day, dayMeetings);
  }
  return (
    <section aria-label={calendarTitle}>
      <Section.Header title={calendarTitle} />
      {meetings.length ? (
        <>
          <Card
            className="agenda-list"
            backgroundColor="var(--t-background-secondary)"
          >
            {Array.from(meetingDays, ([day, dayMeetings]) => (
              <div className="agenda-day" key={day}>
                <time
                  className="agenda-date"
                  dateTime={dayMeetings[0].startsAt}
                  aria-label={new Date(
                    dayMeetings[0].startsAt,
                  ).toLocaleDateString([], { dateStyle: 'full' })}
                >
                  <CalendarDayLabel
                    weekday={new Date(
                      dayMeetings[0].startsAt,
                    ).toLocaleDateString([], {
                      weekday: 'short',
                    })}
                    day={new Date(dayMeetings[0].startsAt).toLocaleDateString(
                      [],
                      { day: 'numeric' },
                    )}
                  />
                </time>
                <div className="agenda-day-meetings">
                  {dayMeetings.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      skipped={state.skippedMeetingIds.includes(meeting.id)}
                      isNext={meeting.id === meetings[0]?.id}
                      autoJoin={state.settings.autoJoin}
                      now={now}
                      command={command}
                      isPending={isPending}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Card>
          {meetings.length > 3 && (
            <div>
              <Button
                variant="ghost"
                className="see-more"
                aria-expanded={showAllMeetings}
                onClick={() => setShowAllMeetings(!showAllMeetings)}
                size="md"
                startIcon={<IconChevronRight />}
              >
                {showAllMeetings ? i18n._('Show less') : i18n._('See more')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card backgroundColor="var(--t-background-secondary)">
          <SettingsCardContent
            icon={
              <IconCalendarEvent
                size={THEME_COMMON.icon.size.md}
                stroke={THEME_COMMON.icon.stroke.sm}
              />
            }
            title={
              state.calendarConnected
                ? i18n._('Your calendar is clear')
                : i18n._('Bring your calendar along')
            }
            description={
              state.calendarConnected
                ? i18n._('Start a recording for an unscheduled conversation.')
                : i18n._(
                    'Connect a calendar in Twenty to see your upcoming meetings.',
                  )
            }
          >
            {!state.calendarConnected && (
              <Button
                onClick={() => void command({ type: 'open-calendar-settings' })}
                variant="outline"
                size="md"
                startIcon={<IconArrowUpRight />}
              >
                {i18n._('Connect calendar')}
              </Button>
            )}
          </SettingsCardContent>
        </Card>
      )}
    </section>
  );
};

export const Home = ({ state, command, isPending }: ActionProps) => {
  return (
    <>
      <UpcomingMeetings state={state} command={command} isPending={isPending} />
      <section
        className="section recordings-section"
        aria-label={i18n._('Recordings')}
      >
        <Section.Header
          title={i18n._('Recordings')}
          adornment={
            <Button
              variant="ghost"
              startIcon={<IconArrowUpRight />}
              disabled={isPending('open-recordings')}
              onClick={() => void command({ type: 'open-recordings' })}
            >
              {i18n._('View all in Twenty')}
            </Button>
          }
        />
        <RecordingList state={state} isPending={isPending} command={command} />
      </section>
    </>
  );
};
