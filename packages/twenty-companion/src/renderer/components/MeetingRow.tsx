import { i18n } from '@lingui/core';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import {
  IconArrowUpRight,
  IconCalendarEvent,
  IconCalendarX,
  IconDotsVertical,
} from 'twenty-ui/icon';
import { type Meeting } from '../../shared/types/Meeting';
import { type ActionProps } from '../types/ActionProps';
import { formatTime } from '../utils/formatTime';
import { CalendarEventIndicator } from './CalendarEventIndicator';

type MeetingRowProps = Pick<ActionProps, 'command' | 'isPending'> & {
  meeting: Meeting;
  skipped: boolean;
  isNext: boolean;
  autoJoin: boolean;
  now: number;
};

export const MeetingRow = ({
  meeting,
  skipped,
  isNext,
  autoJoin,
  now,
  command,
  isPending,
}: MeetingRowProps) => (
  <div className="agenda-row" data-next={isNext || undefined}>
    <div className="grow agenda-meeting-details">
      <CalendarEventIndicator className="agenda-event-indicator" />
      <strong>{meeting.title}</strong>
      <span
        className="small muted"
        title={
          skipped
            ? i18n._('Auto-join skipped')
            : meeting.usesCalendarBot
              ? i18n._('Calendar bot recording')
              : meeting.recordingEnabled
                ? i18n._('Desktop recording available')
                : i18n._('Recording is off')
        }
      >
        {formatTime(meeting.startsAt)} – {formatTime(meeting.endsAt)}
        {(skipped || !meeting.recordingEnabled || meeting.usesCalendarBot) && (
          <>
            {' '}
            ·{' '}
            {skipped
              ? i18n._('Auto-join skipped')
              : meeting.usesCalendarBot
                ? i18n._('Calendar bot')
                : i18n._('Recording off')}
          </>
        )}
      </span>
    </div>
    <div className="agenda-actions">
      {autoJoin && meeting.url && Date.parse(meeting.startsAt) > now && (
        <Dropdown.Root type="menu">
          <Dropdown.Trigger
            render={
              <IconButton
                variant="ghost"
                size="md"
                aria-label={i18n._('Meeting options')}
              >
                <IconDotsVertical />
              </IconButton>
            }
          />
          <Dropdown.Content
            side="bottom"
            align="end"
            sideOffset={4}
            width="max-content"
          >
            <div className="meeting-menu-content">
              <Dropdown.ActionItem
                disabled={isPending('skip', 'unskip')}
                startIcon={skipped ? <IconCalendarEvent /> : <IconCalendarX />}
                onClick={() =>
                  void command({
                    type: skipped ? 'unskip' : 'skip',
                    meetingId: meeting.id,
                  })
                }
              >
                {skipped
                  ? i18n._('Restore auto-join')
                  : i18n._('Skip auto-join')}
              </Dropdown.ActionItem>
            </div>
          </Dropdown.Content>
        </Dropdown.Root>
      )}
      <Button
        disabled={!meeting.url || isPending('join')}
        onClick={() =>
          void command({
            type: 'join',
            meetingId: meeting.id,
          })
        }
        variant="outline"
        size="md"
        startIcon={<IconArrowUpRight />}
      >
        {i18n._('Join')}
      </Button>
    </div>
  </div>
);
