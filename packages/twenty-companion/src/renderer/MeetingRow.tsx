import { i18n } from '@lingui/core';
import { Menu } from '@base-ui/react/menu';
import { CalendarEventIndicator } from './components/CalendarDayLabel/CalendarEventIndicator';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { Button } from '@ui/input/Button/Button';
import { MenuItem } from '@ui/navigation/MenuItem/MenuItem';
import styles from './MeetingRow.module.scss';
import {
  IconCalendarEvent,
  IconCalendarX,
  IconDotsVertical,
  IconArrowUpRight,
} from 'twenty-ui/icon';
import { type Meeting } from '../shared/types';
import { type ActionProps } from './components';
import { formatTime } from './format';

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
        <Menu.Root>
          <Menu.Trigger
            render={
              <IconButton
                variant="tertiary"
                Icon={IconDotsVertical}
                size="medium"
                ariaLabel={i18n._('Meeting options')}
              />
            }
          />
          <Menu.Portal>
            <Menu.Positioner
              side="bottom"
              align="end"
              sideOffset={4}
              className="meeting-menu"
            >
              <Menu.Popup className={styles.popup}>
                <Menu.Item
                  disabled={isPending('skip', 'unskip')}
                  onClick={() =>
                    void command({
                      type: skipped ? 'unskip' : 'skip',
                      meetingId: meeting.id,
                    })
                  }
                >
                  <MenuItem
                    LeftIcon={skipped ? IconCalendarEvent : IconCalendarX}
                    text={
                      skipped
                        ? i18n._('Restore auto-join')
                        : i18n._('Skip auto-join')
                    }
                  />
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}
      <Button
        disabled={!meeting.url || isPending('join')}
        onClick={() =>
          void command({
            type: 'join',
            meetingId: meeting.id,
          })
        }
        variant="secondary"
        size="medium"
        title={i18n._('Join')}
        Icon={IconArrowUpRight}
      />
    </div>
  </div>
);
