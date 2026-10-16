import { getUpcomingMeetings } from '../../shared/utils/getUpcomingMeetings';
import { type MenuItemConstructorOptions } from 'electron';
import { i18n } from '../../shared/i18n';
import { type CompanionCommand } from '../../shared/types/CompanionCommand';
import { type CompanionPage } from '../../shared/types/CompanionPage';
import { type CompanionState } from '../../shared/types/CompanionState';
import { type Meeting } from '../../shared/types/Meeting';
import { doNotTranslate } from '../../shared/utils/doNotTranslate';

type TrayMenuActions = {
  command: (command: CompanionCommand) => void;
  openApp: (page?: CompanionPage) => void;
  setSetting: (key: 'autoJoin', value: boolean) => void;
  quit: () => void;
};

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
  if (date.toDateString() === today.toDateString()) return i18n._('Today');
  if (date.toDateString() === tomorrow.toDateString())
    return i18n._('Tomorrow');
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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
  const age = now - Date.parse(state.updatedAt ?? '');
  const ready = connected && age >= 0 && age <= 90_000;
  const menu: MenuItemConstructorOptions[] = [
    {
      label: i18n._('Open app'),
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
        label: {
          starting: i18n._('Starting recording…'),
          recording: i18n._('Pause recording'),
          pausing: i18n._('Pausing…'),
          paused: i18n._('Resume recording'),
          resuming: i18n._('Resuming…'),
          stopping: i18n._('Finishing recording…'),
        }[recording.status],
        enabled: stable,
        click: () => actions.command({ type: paused ? 'resume' : 'pause' }),
      },
      {
        label: i18n._('Finish recording'),
        enabled: stable,
        click: () => actions.command({ type: 'stop' }),
      },
    );
  } else if (!connected || !state.settings.setupCompleted) {
    menu.push({
      label: connected
        ? i18n._('Continue setup…')
        : i18n._('Connect workspace…'),
      enabled: state.connection !== 'connecting',
      click: () => actions.openApp(),
    });
  } else {
    menu.push({
      label: i18n._('New recording'),
      enabled: ready,
      click: () => actions.command({ type: 'record' }),
    });
  }

  if (connected) {
    const meetings = getUpcomingMeetings({
      meetings: state.meetings,
      now: now,
    }).slice(0, 3);
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
              i18n._('Join {title}', {
                title:
                  next.title.length > 42
                    ? next.title.slice(0, 41) + '…'
                    : next.title,
              }),
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
            ? i18n._('Now')
            : minutes <= 60
              ? i18n._('In {minutes} min', { minutes })
              : '';
        const details = [
          when,
          timing,
          skipped ? i18n._('Auto-join skipped') : '',
          !meeting.url ? i18n._('No meeting link') : '',
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
              label: meeting.url
                ? i18n._('Join meeting')
                : i18n._('No meeting link'),
              enabled: ready && !!meeting.url,
              click: () =>
                actions.command({ type: 'join', meetingId: meeting.id }),
            },
            {
              label: skipped
                ? i18n._('Restore auto-join')
                : i18n._('Skip auto-join'),
              enabled:
                ready &&
                !!meeting.url &&
                state.settings.autoJoin &&
                Date.parse(meeting.startsAt) > now,
              click: () =>
                actions.command({
                  type: skipped ? 'unskip' : 'skip',
                  meetingId: meeting.id,
                }),
            },
            { type: 'separator' },
            {
              label: !meeting.recordingEnabled
                ? i18n._('Recording off')
                : meeting.usesCalendarBot
                  ? i18n._('Calendar bot scheduled')
                  : i18n._('Desktop recording available'),
              enabled: false,
            },
          ],
        });
      }
    } else {
      menu.push({ label: i18n._('No upcoming meetings'), enabled: false });
    }
    if (!state.calendarConnected) {
      menu.push({
        label: i18n._('Connect a calendar…'),
        click: () => actions.command({ type: 'open-calendar-settings' }),
      });
    }
  }
  if (state.error) {
    menu.push({
      label: i18n._('Something needs your attention…'),
      click: () => actions.openApp(),
    });
  }
  menu.push(
    { type: 'separator' },
    {
      label: i18n._('Automatically join meetings'),
      type: 'checkbox',
      checked: state.settings.autoJoin,
      enabled: connected,
      click: () => actions.setSetting('autoJoin', !state.settings.autoJoin),
    },
    {
      label: i18n._('Settings…'),
      accelerator: doNotTranslate('CommandOrControl+,'),
      click: () => actions.openApp('settings'),
    },
    { type: 'separator' },
    {
      label: i18n._('Quit'),
      click: actions.quit,
    },
  );
  return menu;
};
