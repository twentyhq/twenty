import { i18n } from '@lingui/core';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Menu } from '@ui/primitives/surfaces/Menu/Menu';
import { CalendarEventIndicator } from './CalendarEventIndicator';
import { IconButton } from '@ui/components/IconButton/IconButton';
import { Button } from '@ui/primitives/input/Button/Button';
import styles from './MeetingRow.module.scss';
import {
  IconCalendarEvent,
  IconCalendarX,
  IconDotsVertical,
  IconArrowUpRight,
} from 'twenty-ui/icon';
import { type Meeting } from '../../shared/types/Meeting';
import { type ActionProps } from '../types/ActionProps';
import { formatTime } from '../utils/formatTime';

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
        <MenuPrimitive.Root>
          <MenuPrimitive.Trigger
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
          <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner
              side="bottom"
              align="end"
              sideOffset={4}
              className="meeting-menu"
            >
              <MenuPrimitive.Popup className={styles.popup}>
                <Menu.Item
                  startIcon={
                    skipped ? <IconCalendarEvent /> : <IconCalendarX />
                  }
                  disabled={isPending('skip', 'unskip')}
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
                </Menu.Item>
              </MenuPrimitive.Popup>
            </MenuPrimitive.Positioner>
          </MenuPrimitive.Portal>
        </MenuPrimitive.Root>
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
