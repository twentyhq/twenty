import { useNow } from './useNow';
import { MeetingRow } from './MeetingRow';
import { i18n } from '@lingui/core';
import { SettingsCardContent } from '@ui/surfaces/SettingsCardContent/SettingsCardContent';
import { H2Title } from '@ui/typography/H2Title/H2Title';
import { ICON } from '@ui/theme/constants/Icon';
import { Card } from '@ui/surfaces/Card/Card';
import { CalendarDayLabel } from '@ui/data-display/CalendarDayLabel/CalendarDayLabel';
import { SearchInput } from '@ui/input/SearchInput/SearchInput';
import { useState } from 'react';
import {
  IconCalendarEvent,
  IconArrowUpRight,
  IconChevronRight,
} from 'twenty-ui/icon';
import { getUpcomingMeetings } from '../shared/meetings';
import { Button } from '@ui/input/Button/Button';
import { type ActionProps } from './components';
import { RecordingList } from './Recordings';

const UpcomingMeetings = ({ state, isPending, command }: ActionProps) => {
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const now = useNow(1000);
  const meetings = getUpcomingMeetings(state.meetings, now);
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
      <H2Title title={calendarTitle} />
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
            <div aria-expanded={showAllMeetings}>
              <Button
                variant="tertiary"
                className="see-more"
                onClick={() => setShowAllMeetings(!showAllMeetings)}
                size="medium"
                title={
                  showAllMeetings ? i18n._('Show less') : i18n._('See more')
                }
                Icon={IconChevronRight}
              />
            </div>
          )}
        </>
      ) : (
        <Card backgroundColor="var(--t-background-secondary)">
          <SettingsCardContent
            icon={
              <IconCalendarEvent size={ICON.size.md} stroke={ICON.stroke.sm} />
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
                variant="secondary"
                size="medium"
                title={i18n._('Connect calendar')}
                Icon={IconArrowUpRight}
              />
            )}
          </SettingsCardContent>
        </Card>
      )}
    </section>
  );
};

export const Home = ({ state, command, isPending }: ActionProps) => {
  const [recordingSearch, setRecordingSearch] = useState('');
  return (
    <>
      <UpcomingMeetings state={state} command={command} isPending={isPending} />
      <section
        className="section recordings-section"
        aria-label={i18n._('Recordings')}
      >
        <H2Title
          title={i18n._('Recordings')}
          adornment={
            <div className="home-recordings-search">
              <SearchInput
                aria-label={i18n._('Search recordings')}
                placeholder={i18n._('Search recordings…')}
                value={recordingSearch}
                onChange={setRecordingSearch}
              />
            </div>
          }
        />
        <RecordingList
          state={state}
          isPending={isPending}
          command={command}
          search={recordingSearch}
        />
      </section>
    </>
  );
};
