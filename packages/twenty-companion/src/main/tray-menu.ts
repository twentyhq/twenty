import { getUpcomingMeetings } from '../shared/meetings';
import { type MenuItemConstructorOptions } from 'electron';
import { i18n } from '@lingui/core';
import {
  type CompanionCommand,
  type CompanionPage,
  type CompanionState,
  type Meeting,
} from '../shared/types';

type TrayMenuActions = {
  command: (command: CompanionCommand) => void;
  openApp: (page?: CompanionPage) => void;
  setSetting: (key: 'autoJoin', value: boolean) => void;
  quit: () => void;
};

i18n.load('en', {});
i18n.activate('en');
const text = (message: string) => i18n._(message);
const menuLabel = (value: string) =>
  value.replace(/[\r\n\t]/g, ' ').replace(/&/g, '&&');

type MenuPresentation = {
  supportsSublabels: boolean;
  supportsHeaders: boolean;
  locale?: string;
};
const meetingTime = (meeting: Meeting, locale?: string) => {
  const format = (value: string) =>
    new Date(value).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  return `${format(meeting.startsAt)} – ${format(meeting.endsAt)}`;
};
const meetingDay = (meeting: Meeting, now: number, locale?: string) => {
  const date = new Date(meeting.startsAt);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return text('Today');
  if (date.toDateString() === tomorrow.toDateString()) return text('Tomorrow');
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getTrayTitle = (
  state: CompanionState,
  now = Date.now(),
): string => {
  if (state.activeRecording)
    return state.activeRecording.status === 'paused' ? 'Paused' : '●';
  if (!state.settings.showMeetingCountdown) return '';
  const next = getUpcomingMeetings(state.meetings, now)[0];
  if (!next) return '';
  const minutes = Math.max(
    0,
    Math.ceil((Date.parse(next.startsAt) - now) / 60_000),
  );
  return minutes <= 60 ? `${minutes}m` : '';
};

export const createTrayMenuTemplate = (
  state: CompanionState,
  actions: TrayMenuActions,
  now = Date.now(),
  presentation: MenuPresentation = {
    supportsSublabels: false,
    supportsHeaders: false,
  },
): MenuItemConstructorOptions[] => {
  const connected = state.connection === 'connected';
  const recording = state.activeRecording;
  const ready = connected && !!state.updatedAt;
  const menu: MenuItemConstructorOptions[] = [
    {
      label: text('Open app'),
      accelerator: state.settings.openShortcut,
      click: () => actions.openApp(),
    },
  ];

  if (recording) {
    const paused = recording.status === 'paused';
    const stable = recording.status === 'recording' || paused;
    menu.push(
      {
        label: menuLabel(recording.title),
        enabled: false,
      },
      {
        label: text(
          {
            starting: 'Starting recording…',
            recording: 'Pause recording',
            pausing: 'Pausing…',
            paused: 'Resume recording',
            resuming: 'Resuming…',
            stopping: 'Finishing recording…',
          }[recording.status],
        ),
        enabled: stable,
        click: () => actions.command({ type: paused ? 'resume' : 'pause' }),
      },
      {
        label: text('Finish recording'),
        enabled: stable,
        click: () => actions.command({ type: 'stop' }),
      },
    );
  } else if (!connected || !state.settings.setupCompleted) {
    menu.push({
      label: text(connected ? 'Continue setup…' : 'Connect workspace…'),
      enabled: state.connection !== 'connecting',
      click: () => actions.openApp(),
    });
  } else {
    menu.push({
      label: text('New recording'),
      enabled: ready,
      click: () => actions.command({ type: 'record' }),
    });
  }

  if (connected) {
    const meetings = getUpcomingMeetings(state.meetings, now).slice(0, 3);
    menu.push({ type: 'separator' });
    if (meetings.length) {
      const imminent = meetings.filter(
        (meeting) =>
          meeting.url && Date.parse(meeting.startsAt) <= now + 10 * 60_000,
      );
      if (
        ready &&
        imminent.length === 1 &&
        !recording &&
        !state.detectedCalls.length
      ) {
        const next = imminent[0];
        menu.push(
          {
            label: menuLabel(
              `${text('Join')} ${next.title.length > 42 ? next.title.slice(0, 41) + '…' : next.title}`,
            ),
            toolTip: next.title,
            click: () => actions.command({ type: 'join', meetingId: next.id }),
          },
          { type: 'separator' },
        );
      }
      let previousDay = '';
      for (const meeting of meetings) {
        const day = meetingDay(meeting, now, presentation.locale);
        if (day !== previousDay) {
          if (previousDay) menu.push({ type: 'separator' });
          menu.push({
            label: day,
            type: presentation.supportsHeaders ? 'header' : 'normal',
            enabled: false,
          });
          previousDay = day;
        }
        const minutes = Math.ceil(
          (Date.parse(meeting.startsAt) - now) / 60_000,
        );
        const when = meetingTime(meeting, presentation.locale);
        const skipped = state.skippedMeetingIds.includes(meeting.id);
        const title =
          meeting.title.length > 42
            ? meeting.title.slice(0, 41) + '…'
            : meeting.title;
        const timing =
          minutes <= 0
            ? text('Now')
            : minutes <= 60
              ? `${text('In')} ${minutes} ${text('min')}`
              : '';
        const details = [
          when,
          timing,
          skipped ? text('Auto-join skipped') : '',
          !meeting.url ? text('No meeting link') : '',
        ]
          .filter(Boolean)
          .join(' · ');
        menu.push({
          label: menuLabel(
            presentation.supportsSublabels ? title : `${details} · ${title}`,
          ),
          ...(presentation.supportsSublabels ? { sublabel: details } : {}),
          accessibilityLabel: `${meeting.title}, ${day}, ${details}`,
          toolTip: `${meeting.title}\n${day} · ${when}`,
          submenu: [
            {
              label: text(meeting.url ? 'Join meeting' : 'No meeting link'),
              enabled: ready && !!meeting.url,
              click: () =>
                actions.command({ type: 'join', meetingId: meeting.id }),
            },
            {
              label: text(skipped ? 'Auto-join skipped' : 'Skip auto-join'),
              enabled:
                ready &&
                !!meeting.url &&
                state.settings.autoJoin &&
                !skipped &&
                Date.parse(meeting.startsAt) > now,
              click: () =>
                actions.command({ type: 'skip', meetingId: meeting.id }),
            },
            { type: 'separator' },
            {
              label: text(
                !meeting.recordingEnabled
                  ? 'Recording off'
                  : meeting.usesCalendarBot
                    ? 'Calendar bot scheduled'
                    : 'Desktop recording available',
              ),
              enabled: false,
            },
          ],
        });
      }
    } else {
      menu.push({ label: text('No upcoming meetings'), enabled: false });
    }
    if (!state.calendarConnected) {
      menu.push({
        label: text('Connect a calendar…'),
        click: () => actions.command({ type: 'open-calendar-settings' }),
      });
    }
  }
  if (state.error) {
    menu.push({
      label: text('Something needs your attention…'),
      click: () => actions.openApp(),
    });
  }
  menu.push(
    { type: 'separator' },
    {
      label: text('Automatically join meetings'),
      type: 'checkbox',
      checked: state.settings.autoJoin,
      enabled: connected,
      click: () => actions.setSetting('autoJoin', !state.settings.autoJoin),
    },
    {
      label: text('Settings…'),
      accelerator: 'CommandOrControl+,',
      click: () => actions.openApp('settings'),
    },
    { type: 'separator' },
    {
      label: text('Quit'),
      click: actions.quit,
    },
  );
  return menu;
};
